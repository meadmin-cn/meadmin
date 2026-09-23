import { InjectRepository, Transaction } from '@/decorators/index.js';
import { AonCmsOrder } from '@/entities/aonCmsOrder.entity.js';
import { Provide } from '@midwayjs/core';
import { NotFoundError } from '@midwayjs/core/dist/error/http.js';
import { Attributes, Op, WhereOptions } from '@sequelize/core';
import { orderStatusSchema } from '../dto/order.dto.js';
import { CmsQueryDto, querySchema } from '../dto/common.dto.js';
import { validateCms } from './guard.js';

@Provide()
export class AonCmsOrderService {
  @InjectRepository(AonCmsOrder) repository: typeof AonCmsOrder;

  async list(input: CmsQueryDto) {
    const q = validateCms<CmsQueryDto>(querySchema, input);
    const where: WhereOptions<Attributes<AonCmsOrder>> = {};
    if (q.keyword) where.orderNo = { [Op.iLike]: `%${q.keyword}%` };
    if (q.status !== undefined) where.status = q.status;
    const { rows, count } = await this.repository.findAndCountAll({ where, offset: (q.page - 1) * q.pageSize, limit: q.pageSize, order: [['createdAt', 'DESC'], ['id', 'DESC']] });
    return { list: rows, total: count, page: q.page, pageSize: q.pageSize };
  }

  async info(id: string) {
    const row = await this.repository.findByPk(id);
    if (!row) throw new NotFoundError('订单不存在');
    return row;
  }

  @Transaction()
  async updateStatus(id: string, input: { status: number; paymentStatus: number }) {
    const data = validateCms(orderStatusSchema, input) as { status: number; paymentStatus: number };
    const row = await this.info(id);
    return row.update({ status: data.status, paymentStatus: data.paymentStatus });
  }
}
