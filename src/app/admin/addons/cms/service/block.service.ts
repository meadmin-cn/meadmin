import { InjectRepository, Transaction } from '@/decorators/index.js';
import { AonCmsBlock } from '@/entities/aonCmsBlock.entity.js';
import { Provide } from '@midwayjs/core';
import { BadRequestError, NotFoundError } from '@midwayjs/core/dist/error/http.js';
import { Attributes, Op, WhereOptions } from '@sequelize/core';

import { AonCmsBlockSaveDto, blockSchema } from '../dto/block.dto.js';
import { CmsQueryDto, querySchema } from '../dto/common.dto.js';
import { cmsId, validateCms } from './guard.js';

@Provide()
export class AonCmsBlockService {
  @InjectRepository(AonCmsBlock) repository: typeof AonCmsBlock;

  async list(input: CmsQueryDto) {
    const q = validateCms<CmsQueryDto>(querySchema, input);
    const where: WhereOptions<Attributes<AonCmsBlock>> = {};
    if (q.keyword) where.title = { [Op.iLike]: '%' + q.keyword + '%' };
    if (q.status !== undefined) where.status = q.status;

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
  async info(id: string) {
    const row = await this.repository.findByPk(cmsId(id));
    if (!row) throw new NotFoundError('CMS 记录不存在');
    return row;
  }
  // 所有 CMS 写入共用事务锁，保证树移动、引用检查与删除之间不出现并发穿透。
  private async lock() {
    await this.repository.sequelize.query('SELECT pg_advisory_xact_lock(82026, 920)');
  }
  @Transaction()
  async save(id: string | undefined, input: AonCmsBlockSaveDto) {
    const data = validateCms<AonCmsBlockSaveDto>(blockSchema, input);
    await this.lock();
    const row = id ? await this.info(id) : null;
    const duplicate = await this.repository.findOne({ where: { slug: data.slug, ...(id ? { id: { [Op.ne]: id } } : {}) } });
    if (duplicate) throw new BadRequestError('SEO 标识已存在');

    if (data.startAt && data.endAt && new Date(data.startAt) >= new Date(data.endAt)) throw new BadRequestError('结束时间必须晚于开始时间');
    const values = { title: data.title, slug: data.slug, position: data.position, kind: data.kind, mdContent: data.mdContent, coverUrl: data.coverUrl, link: data.link, status: data.status, startAt: data.startAt, endAt: data.endAt, orderNum: data.orderNum };
    if (!row) return this.repository.create(values);
    return row.update(values);
  }
  @Transaction()
  async remove(id: string) {
    await this.lock();
    const row = await this.info(id);

    await row.destroy();
  }
}
