import { InjectRepository } from '@/decorators/index.js';
import { AonCmsArticle } from '@/entities/aonCmsArticle.entity.js';
import { AonCmsOrder } from '@/entities/aonCmsOrder.entity.js';
import { Inject, Provide } from '@midwayjs/core';
import { NotFoundError } from '@midwayjs/core/dist/error/http.js';
import { Context } from '@midwayjs/koa';
import { Op } from '@sequelize/core';
import { CmsOrderCreateDto, orderCreateSchema, orderQuerySchema } from '../../../../admin/addons/cms/dto/order.dto.js';
import { validateCms } from '../../../../admin/addons/cms/service/guard.js';

const makeOrderNo = () => `CMS${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;

@Provide()
export class AonCmsPublicOrderService {
  @InjectRepository(AonCmsOrder) repository: typeof AonCmsOrder;
  @InjectRepository(AonCmsArticle) article: typeof AonCmsArticle;
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
    return this.publicRow(row);
  }

  async query(input: { orderNo: string; contactPhone: string }): Promise<Record<string, unknown>> {
    const data = validateCms(orderQuerySchema, input) as { orderNo: string; contactPhone: string };
    const row = await this.repository.findOne({ where: { orderNo: data.orderNo, contactPhone: data.contactPhone } });
    if (!row) throw new NotFoundError('订单不存在或联系方式不匹配');
    return this.publicRow(row);
  }

  private publicRow(row: AonCmsOrder): Record<string, unknown> {
    return { orderNo: row.orderNo, articleId: row.articleId, itemName: row.itemName, contactName: row.contactName, contactPhone: row.contactPhone, shippingAddress: row.shippingAddress, quantity: row.quantity, amount: row.amount, status: row.status, paymentStatus: row.paymentStatus, remark: row.remark, accountLinked: Boolean(row.userId), createdAt: row.createdAt, updatedAt: row.updatedAt };
  }
}
