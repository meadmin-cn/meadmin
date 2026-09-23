import { InjectRepository } from '@/decorators/index.js';
import { AonCmsMessage } from '@/entities/aonCmsMessage.entity.js';
import { Provide } from '@midwayjs/core';
import { NotFoundError } from '@midwayjs/core/dist/error/http.js';
import { Op } from '@sequelize/core';
import { CmsQueryDto, querySchema } from '../dto/common.dto.js';
import { CmsMessageSaveDto, messageSchema } from '../dto/message.dto.js';
import { validateCms } from './guard.js';
@Provide()
export class AonCmsMessageService {
  @InjectRepository(AonCmsMessage) repository: typeof AonCmsMessage;
  async list(input: CmsQueryDto) { const q = validateCms<CmsQueryDto>(querySchema, input); const where = { ...(q.keyword ? { content: { [Op.iLike]: `%${q.keyword}%` } } : {}), ...(q.status === undefined ? {} : { status: q.status }) }; const { rows, count } = await this.repository.findAndCountAll({ where, offset: (q.page - 1) * q.pageSize, limit: q.pageSize, order: [['createdAt', 'DESC']] }); return { list: rows, total: count, page: q.page, pageSize: q.pageSize }; }
  async info(id: string) { const row = await this.repository.findByPk(id); if (!row) throw new NotFoundError('留言不存在'); return row; }
  async update(id: string, input: CmsMessageSaveDto) { const data = validateCms<CmsMessageSaveDto>(messageSchema, input); return (await this.info(id)).update(data); }
  async remove(id: string) { await (await this.info(id)).destroy(); }
}
