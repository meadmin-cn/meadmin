import { InjectRepository, Transaction } from '@/decorators/index.js';
import { AonCmsPage } from '@/entities/aonCmsPage.entity.js';
import { Provide } from '@midwayjs/core';
import { BadRequestError, NotFoundError } from '@midwayjs/core/dist/error/http.js';
import { Attributes, Op, WhereOptions } from '@sequelize/core';

import { CmsQueryDto, CmsReviewDto, querySchema, reviewSchema } from '../dto/common.dto.js';
import { AonCmsPageSaveDto, pageSchema } from '../dto/page.dto.js';
import { canSubmitCms, cmsId, validateCms } from './guard.js';

@Provide()
export class AonCmsPageService {
  @InjectRepository(AonCmsPage) repository: typeof AonCmsPage;

  async list(input: CmsQueryDto) {
    const q = validateCms<CmsQueryDto>(querySchema, input);
    const where: WhereOptions<Attributes<AonCmsPage>> = {};
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
  async save(id: string | undefined, input: AonCmsPageSaveDto) {
    const data = validateCms<AonCmsPageSaveDto>(pageSchema, input);
    await this.lock();
    const row = id ? await this.info(id) : null;
    const duplicate = await this.repository.findOne({ where: { slug: data.slug, ...(id ? { id: { [Op.ne]: id } } : {}) } });
    if (duplicate) throw new BadRequestError('SEO 标识已存在');

    const values = { title: data.title, slug: data.slug, summary: data.summary, mdContent: data.mdContent, coverUrl: data.coverUrl, seoTitle: data.seoTitle, seoKeywords: data.seoKeywords, seoDescription: data.seoDescription, publishAt: data.publishAt, orderNum: data.orderNum, status: 0 };
    if (!row) return this.repository.create(values);
    return row.update(values);
  }
  @Transaction()
  async remove(id: string) {
    await this.lock();
    const row = await this.info(id);

    await row.destroy();
  }

  @Transaction()
  async submit(id: string) {
    await this.lock();
    const row = await this.info(id);
    if (!canSubmitCms(row.status)) throw new BadRequestError('当前状态不能提交审核');
    if (!row.mdContent.trim()) throw new BadRequestError('内容不能为空');
    return row.update({ status: 1 });
  }
  @Transaction()
  async offline(id: string) {
    await this.lock();
    const row = await this.info(id);
    if (row.status !== 2) throw new BadRequestError('仅发布内容可以下线');
    return row.update({ status: 4 });
  }
  @Transaction()
  async review(id: string, input: CmsReviewDto) {
    const data = validateCms<CmsReviewDto>(reviewSchema, input);
    await this.lock();
    const row = await this.info(id);
    if (row.status !== 1) throw new BadRequestError('仅待审核内容可以审核');
    return row.update({ status: data.approve ? 2 : 3, publishAt: data.approve ? (row.publishAt ?? new Date()) : row.publishAt });
  }
}
