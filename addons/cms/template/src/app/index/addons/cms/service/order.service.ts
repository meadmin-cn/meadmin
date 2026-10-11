import { InjectRepository } from '@/decorators/index.js';
import { AonCmsArticle } from '@/entities/aonCmsArticle.entity.js';
import { AonCmsOrder } from '@/entities/aonCmsOrder.entity.js';
import { AonCmsOrderLog } from '@/entities/aonCmsOrderLog.entity.js';
import { Inject, Provide } from '@midwayjs/core';
import { NotFoundError } from '@midwayjs/core/dist/error/http.js';
import { Context } from '@midwayjs/koa';
import { Attributes, Op, WhereOptions } from '@sequelize/core';
import { CmsOrderCreateDto, orderCreateSchema, orderQuerySchema } from '../../../../admin/addons/cms/dto/order.dto.js';
import { validateCms } from '../../../../admin/addons/cms/service/guard.js';

const makeOrderNo = () => `CMS${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;

@Provide()
export class AonCmsPublicOrderService {
  @InjectRepository(AonCmsOrder) repository: typeof AonCmsOrder;
  @InjectRepository(AonCmsArticle) article: typeof AonCmsArticle;
  @InjectRepository(AonCmsOrderLog) log: typeof AonCmsOrderLog;
  @Inject() ctx: Context;

  async create(slug: string, input: CmsOrderCreateDto): Promise<Record<string, unknown>> {
    const data = validateCms<CmsOrderCreateDto>(orderCreateSchema, input);
    const article = await this.article.findOne({ attributes: ['id', 'title'], where: { slug, status: 2, orderEnabled: true, publishAt: { [Op.lte]: new Date() } } });
    if (!article) throw new NotFoundError('内容不存在或未启用下单');
    const row = await this.repository.create({
      orderNo: makeOrderNo(),
      articleId: article.id,
      userId: this.ctx.userInfo?.id ?? null,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      shippingAddress: data.shippingAddress,
      itemName: article.title,
      quantity: data.quantity,
      amount: '0',
      status: 0,
      paymentStatus: 0,
      remark: data.remark ?? '',
    });
    await this.log.create({ orderId: row.id, action: 'create', content: `${this.ctx.userInfo?.id ? '会员' : '访客'}提交订单：${article.title} × ${data.quantity}` });
    return this.publicRow(row);
  }

  async query(input: { orderNo: string; contactPhone: string }): Promise<Record<string, unknown>> {
    const data = validateCms<{ orderNo: string; contactPhone: string }>(orderQuerySchema, input);
    const where: WhereOptions<Attributes<AonCmsOrder>> = { orderNo: data.orderNo, contactPhone: data.contactPhone };
    if (this.ctx.userInfo) where.userId = this.ctx.userInfo.id;
    const row = await this.repository.findOne({ where });
    if (!row) throw new NotFoundError('订单不存在或联系方式不匹配');
    return this.publicRow(row);
  }

  async listMine(input: { page?: number; pageSize?: number }) {
    const page = Math.max(Number(input?.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(input?.pageSize) || 10, 1), 50);
    const userId = this.ctx.userInfo?.id;
    if (!userId) throw new NotFoundError('请登录后查看订单');
    const { rows, count } = await this.repository.findAndCountAll({
      where: { userId },
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
    });
    return { list: rows.map((row) => this.publicRow(row)), total: count, page, pageSize };
  }

  private publicRow(row: AonCmsOrder): Record<string, unknown> {
    return {
      orderNo: row.orderNo,
      articleId: row.articleId,
      itemName: row.itemName,
      contactName: row.contactName,
      contactPhone: row.contactPhone,
      shippingAddress: row.shippingAddress,
      quantity: row.quantity,
      amount: row.amount,
      status: row.status,
      paymentStatus: row.paymentStatus,
      shippingStatus: row.shippingStatus,
      expressCompany: row.expressCompany,
      expressNo: row.expressNo,
      shippedAt: row.shippedAt,
      paidAmount: row.paidAmount,
      paymentMethod: row.paymentMethod,
      paidAt: row.paidAt,
      remark: row.remark,
      accountLinked: Boolean(row.userId),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
