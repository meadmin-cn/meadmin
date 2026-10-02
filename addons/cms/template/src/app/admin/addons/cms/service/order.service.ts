import { InjectRepository, Transaction } from '@/decorators/index.js';
import { AonCmsArticle } from '@/entities/aonCmsArticle.entity.js';
import { AonCmsOrder } from '@/entities/aonCmsOrder.entity.js';
import { AonCmsOrderLog, CmsOrderAction } from '@/entities/aonCmsOrderLog.entity.js';
import { Provide } from '@midwayjs/core';
import { BadRequestError, NotFoundError } from '@midwayjs/core/dist/error/http.js';
import { Attributes, Op, WhereOptions } from '@sequelize/core';
import {
  adminOrderListSchema,
  CmsAdminOrderListDto,
  CmsOrderEditDto,
  CmsOrderFollowDto,
  CmsOrderPayDto,
  CmsOrderReasonDto,
  CmsOrderShipDto,
  orderEditSchema,
  orderFollowSchema,
  orderPaySchema,
  orderReasonSchema,
  orderShipSchema,
} from '../dto/order.dto.js';
import { cmsId, validateCms } from './guard.js';

/** 订单状态：0待处理 1处理中 2已完成 3已关闭 */
export const ORDER_STATUS = { PENDING: 0, PROCESSING: 1, COMPLETED: 2, CLOSED: 3 } as const;
/** 收款状态：0待收款 1已收款 2已退款 */
export const PAYMENT_STATUS = { UNPAID: 0, PAID: 1, REFUNDED: 2 } as const;
/** 发货状态：0未发货 1已发货 2已签收 */
export const SHIPPING_STATUS = { UNSHIPPED: 0, SHIPPED: 1, RECEIVED: 2 } as const;

const PAYMENT_METHOD: Record<string, string> = { bank: '银行转账', wechat: '微信', alipay: '支付宝', cash: '现金', other: '其他' };
const toDate = (value?: Date | string | null) => (value ? new Date(value) : new Date());

@Provide()
export class AonCmsOrderService {
  @InjectRepository(AonCmsOrder) repository: typeof AonCmsOrder;
  @InjectRepository(AonCmsOrderLog) logRepository: typeof AonCmsOrderLog;
  @InjectRepository(AonCmsArticle) articleRepository: typeof AonCmsArticle;

  async list(input: CmsAdminOrderListDto) {
    const q = validateCms<CmsAdminOrderListDto>(adminOrderListSchema, input);
    const where: WhereOptions<Attributes<AonCmsOrder>> = {};
    if (q.keyword) {
      const like = { [Op.iLike]: `%${q.keyword}%` };
      Object.assign(where, { [Op.or]: [{ orderNo: like }, { contactName: like }, { contactPhone: like }, { itemName: like }, { expressNo: like }] });
    }
    if (q.status !== undefined) where.status = q.status;
    if (q.paymentStatus !== undefined) where.paymentStatus = q.paymentStatus;
    if (q.shippingStatus !== undefined) where.shippingStatus = q.shippingStatus;
    if (q.articleId) where.articleId = q.articleId;
    if (q.createdAt) where.createdAt = { [Op.between]: [new Date(q.createdAt[0]), new Date(q.createdAt[1])] };
    const { rows, count } = await this.repository.findAndCountAll({
      where,
      offset: (q.page - 1) * q.pageSize,
      limit: q.pageSize,
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
    });
    return { list: rows, total: count, page: q.page, pageSize: q.pageSize };
  }

  /** 顶部汇总：各状态数量与金额 */
  async summary() {
    const rows = (await this.repository.findAll({
      attributes: [
        'status',
        'paymentStatus',
        'shippingStatus',
        [this.repository.sequelize.fn('COUNT', this.repository.sequelize.col('id')), 'total'],
        [this.repository.sequelize.fn('COALESCE', this.repository.sequelize.fn('SUM', this.repository.sequelize.col('paid_amount')), 0), 'paid'],
      ],
      group: ['status', 'paymentStatus', 'shippingStatus'],
      raw: true,
    })) as unknown as Array<{ status: number; paymentStatus: number; shippingStatus: number; total: string; paid: string }>;
    const result = { total: 0, pending: 0, unpaid: 0, toShip: 0, shipped: 0, completed: 0, closed: 0, paidAmount: 0 };
    for (const r of rows) {
      const n = Number(r.total);
      result.total += n;
      if (r.status === ORDER_STATUS.PENDING) result.pending += n;
      if (r.status === ORDER_STATUS.COMPLETED) result.completed += n;
      if (r.status === ORDER_STATUS.CLOSED) result.closed += n;
      const active = r.status === ORDER_STATUS.PENDING || r.status === ORDER_STATUS.PROCESSING;
      if (active && r.paymentStatus === PAYMENT_STATUS.UNPAID) result.unpaid += n;
      if (active && r.shippingStatus === SHIPPING_STATUS.UNSHIPPED) result.toShip += n;
      if (r.shippingStatus !== SHIPPING_STATUS.UNSHIPPED) result.shipped += n;
      if (r.paymentStatus === PAYMENT_STATUS.PAID) result.paidAmount += Number(r.paid);
    }
    result.paidAmount = Math.round(result.paidAmount * 100) / 100;
    return result;
  }

  async info(id: string) {
    const row = await this.repository.findByPk(cmsId(id));
    if (!row) throw new NotFoundError('订单不存在');
    return row;
  }

  /** 详情：订单 + 关联文章 + 跟进日志 */
  async detail(id: string) {
    const order = await this.info(id);
    const [article, logs] = await Promise.all([
      this.articleRepository.findByPk(order.articleId, { attributes: ['id', 'title', 'slug'] }),
      this.logs(order.id),
    ]);
    return { order, article, logs };
  }

  async logs(orderId: string) {
    return this.logRepository.findAll({
      where: { orderId: cmsId(orderId) },
      include: [{ association: 'createdAdmin', attributes: ['id', 'username', 'nickname'] }],
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
    });
  }

  private async lockOrder(id: string) {
    const row = await this.repository.findByPk(cmsId(id), { lock: true });
    if (!row) throw new NotFoundError('订单不存在');
    return row;
  }

  private assertOpen(row: AonCmsOrder) {
    if (row.status === ORDER_STATUS.COMPLETED) throw new BadRequestError('订单已完成，不能再操作');
    if (row.status === ORDER_STATUS.CLOSED) throw new BadRequestError('订单已关闭，不能再操作');
  }

  private log(orderId: string, action: CmsOrderAction, content: string, nextFollowAt: Date | null = null) {
    return this.logRepository.create({ orderId, action, content, nextFollowAt });
  }

  /** 编辑收件信息 / 应收金额 / 内部备注 */
  @Transaction()
  async edit(id: string, input: CmsOrderEditDto) {
    const data = validateCms<CmsOrderEditDto>(orderEditSchema, input);
    const row = await this.lockOrder(id);
    this.assertOpen(row);
    if (row.shippingStatus !== SHIPPING_STATUS.UNSHIPPED && (data.shippingAddress !== row.shippingAddress || data.contactPhone !== row.contactPhone)) {
      throw new BadRequestError('订单已发货，不能修改收件人电话和地址');
    }
    if (row.paymentStatus === PAYMENT_STATUS.PAID && Number(data.amount) !== Number(row.amount)) {
      throw new BadRequestError('订单已收款，不能修改应收金额');
    }
    const changes: string[] = [];
    if (data.contactName !== row.contactName) changes.push(`收件人：${row.contactName} → ${data.contactName}`);
    if (data.contactPhone !== row.contactPhone) changes.push(`电话：${row.contactPhone} → ${data.contactPhone}`);
    if (data.shippingAddress !== row.shippingAddress) changes.push('收件地址已修改');
    if (data.quantity !== row.quantity) changes.push(`数量：${row.quantity} → ${data.quantity}`);
    if (Number(data.amount) !== Number(row.amount)) changes.push(`应收金额：¥${row.amount} → ¥${Number(data.amount).toFixed(2)}`);
    await row.update({
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      shippingAddress: data.shippingAddress,
      quantity: data.quantity,
      amount: Number(data.amount).toFixed(2),
      adminRemark: data.adminRemark ?? '',
      status: row.status === ORDER_STATUS.PENDING ? ORDER_STATUS.PROCESSING : row.status,
    });
    if (changes.length) await this.log(row.id, 'edit', changes.join('；'));
    return row;
  }

  /** 确认线下收款 */
  @Transaction()
  async pay(id: string, input: CmsOrderPayDto) {
    const data = validateCms<CmsOrderPayDto>(orderPaySchema, input);
    const row = await this.lockOrder(id);
    this.assertOpen(row);
    if (row.paymentStatus === PAYMENT_STATUS.PAID) throw new BadRequestError('订单已确认收款');
    const paidAt = toDate(data.paidAt);
    await row.update({
      paymentStatus: PAYMENT_STATUS.PAID,
      paidAmount: Number(data.paidAmount).toFixed(2),
      paymentMethod: data.paymentMethod,
      paymentNo: data.paymentNo ?? '',
      paidAt,
      status: ORDER_STATUS.PROCESSING,
    });
    const text = `确认收款 ¥${Number(data.paidAmount).toFixed(2)}（${PAYMENT_METHOD[data.paymentMethod]}${data.paymentNo ? `，流水号 ${data.paymentNo}` : ''}）`;
    await this.log(row.id, 'pay', data.content ? `${text}；${data.content}` : text);
    return row;
  }

  /** 发货（首次）或修改快递信息（已发货未签收） */
  @Transaction()
  async ship(id: string, input: CmsOrderShipDto) {
    const data = validateCms<CmsOrderShipDto>(orderShipSchema, input);
    const row = await this.lockOrder(id);
    this.assertOpen(row);
    if (row.shippingStatus === SHIPPING_STATUS.RECEIVED) throw new BadRequestError('订单已签收，不能修改快递信息');
    const first = row.shippingStatus === SHIPPING_STATUS.UNSHIPPED;
    await row.update({
      shippingStatus: SHIPPING_STATUS.SHIPPED,
      expressCompany: data.expressCompany,
      expressNo: data.expressNo,
      shippedAt: first ? toDate(data.shippedAt) : (row.shippedAt ?? toDate(data.shippedAt)),
      status: ORDER_STATUS.PROCESSING,
    });
    const text = `${first ? '已发货' : '修改快递信息'}：${data.expressCompany} ${data.expressNo}`;
    await this.log(row.id, 'ship', data.content ? `${text}；${data.content}` : text);
    return row;
  }

  /** 确认签收 */
  @Transaction()
  async receive(id: string, input: CmsOrderReasonDto) {
    const data = validateCms<CmsOrderReasonDto>(orderReasonSchema, input);
    const row = await this.lockOrder(id);
    this.assertOpen(row);
    if (row.shippingStatus !== SHIPPING_STATUS.SHIPPED) throw new BadRequestError('订单未发货，不能确认签收');
    await row.update({ shippingStatus: SHIPPING_STATUS.RECEIVED, receivedAt: new Date() });
    await this.log(row.id, 'receive', data.content ? `确认签收；${data.content}` : '确认签收');
    return row;
  }

  /** 跟进记录，可设置下次跟进时间 */
  @Transaction()
  async follow(id: string, input: CmsOrderFollowDto) {
    const data = validateCms<CmsOrderFollowDto>(orderFollowSchema, input);
    const row = await this.lockOrder(id);
    const nextFollowAt = data.nextFollowAt ? new Date(data.nextFollowAt) : null;
    if (nextFollowAt && nextFollowAt.getTime() < Date.now() - 60_000) throw new BadRequestError('下次跟进时间不能早于当前时间');
    await row.update({
      lastFollowAt: new Date(),
      nextFollowAt,
      status: row.status === ORDER_STATUS.PENDING ? ORDER_STATUS.PROCESSING : row.status,
    });
    await this.log(row.id, 'follow', data.content, nextFollowAt);
    return row;
  }

  /** 完成：必须已收款且已发货 */
  @Transaction()
  async complete(id: string, input: CmsOrderReasonDto) {
    const data = validateCms<CmsOrderReasonDto>(orderReasonSchema, input);
    const row = await this.lockOrder(id);
    this.assertOpen(row);
    if (row.paymentStatus !== PAYMENT_STATUS.PAID) throw new BadRequestError('订单尚未确认收款，不能完成');
    if (row.shippingStatus === SHIPPING_STATUS.UNSHIPPED) throw new BadRequestError('订单尚未发货，不能完成');
    await row.update({
      status: ORDER_STATUS.COMPLETED,
      completedAt: new Date(),
      nextFollowAt: null,
      shippingStatus: SHIPPING_STATUS.RECEIVED,
      receivedAt: row.receivedAt ?? new Date(),
    });
    await this.log(row.id, 'complete', data.content ? `订单完成；${data.content}` : '订单完成');
    return row;
  }

  /** 关闭：已收款的订单关闭时标记为已退款 */
  @Transaction()
  async close(id: string, input: CmsOrderReasonDto) {
    const data = validateCms<CmsOrderReasonDto>(orderReasonSchema, input);
    if (!data.content) throw new BadRequestError('请填写关闭原因');
    const row = await this.lockOrder(id);
    this.assertOpen(row);
    if (row.shippingStatus !== SHIPPING_STATUS.UNSHIPPED) throw new BadRequestError('订单已发货，不能直接关闭');
    const refund = row.paymentStatus === PAYMENT_STATUS.PAID;
    await row.update({
      status: ORDER_STATUS.CLOSED,
      closedAt: new Date(),
      nextFollowAt: null,
      paymentStatus: refund ? PAYMENT_STATUS.REFUNDED : row.paymentStatus,
    });
    await this.log(row.id, 'close', `关闭订单${refund ? '（已收款，标记为退款）' : ''}：${data.content}`);
    return row;
  }

  /** 删除：仅允许删除已关闭订单，同时删除日志 */
  @Transaction()
  async destroy(ids: string[]) {
    const list = [...new Set((Array.isArray(ids) ? ids : [ids]).map((id) => cmsId(String(id))))];
    if (!list.length) throw new BadRequestError('请选择要删除的订单');
    const rows = await this.repository.findAll({ where: { id: list }, lock: true });
    if (rows.length !== list.length) throw new NotFoundError('订单不存在');
    if (rows.some((row) => row.status !== ORDER_STATUS.CLOSED)) throw new BadRequestError('只能删除已关闭的订单');
    await this.logRepository.destroy({ where: { orderId: list } });
    await this.repository.destroy({ where: { id: list } });
    return true;
  }
}
