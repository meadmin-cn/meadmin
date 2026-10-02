import { InjectRepository, Transaction } from '@/decorators/index.js';
import { AonCmsPage } from '@/entities/aonCmsPage.entity.js';
import { AonCmsReviewLog } from '@/entities/aonCmsReviewLog.entity.js';
import { SystemAdmin } from '@/entities/systemAdmin.entity.js';
import { Provide } from '@midwayjs/core';
import { BadRequestError, NotFoundError } from '@midwayjs/core/dist/error/http.js';
import { Attributes, Op, WhereOptions } from '@sequelize/core';

import { CmsQueryDto, CmsReviewDto, querySchema, reviewSchema } from '../dto/common.dto.js';
import { AonCmsPageSaveDto, pageSchema } from '../dto/page.dto.js';
import { canSubmitCms, cmsId, validateCms } from './guard.js';

@Provide()
export class AonCmsPageService {
  @InjectRepository(AonCmsPage) repository: typeof AonCmsPage;
  @InjectRepository(AonCmsReviewLog) reviewLogRepository: typeof AonCmsReviewLog;
  @InjectRepository(SystemAdmin) adminRepository: typeof SystemAdmin;

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
  async reviewHistory(id: string) {
    const rows = await this.reviewLogRepository.findAll({
      where: { contentType: 'page', contentId: cmsId(id) },
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
    });
    const adminIds = [...new Set(rows.map((row) => row.createdAdminId).filter(Boolean))] as string[];
    const admins = adminIds.length ? await this.adminRepository.findAll({ where: { id: { [Op.in]: adminIds } } }) : [];
    const adminMap = new Map(admins.map((admin) => [admin.id, admin.nickname || admin.username]));
    return rows.map((row) => ({ ...row.toJSON(), createdAdminName: row.createdAdminId ? (adminMap.get(row.createdAdminId) ?? '') : '' }));
  }
  // 审核快照：记录操作当时的完整内容，便于在审核历史里「查看当时详情」
  private buildSnapshot(row: AonCmsPage) {
    return JSON.stringify({
      title: row.title,
      slug: row.slug,
      summary: row.summary,
      coverUrl: row.coverUrl,
      kind: row.kind,
      link: row.link,
      target: row.target,
      seoTitle: row.seoTitle,
      seoKeywords: row.seoKeywords,
      seoDescription: row.seoDescription,
      publishAt: row.publishAt,
      orderNum: row.orderNum,
      mdContent: row.mdContent,
    });
  }
  private async logReview(contentId: string, fromStatus: number, toStatus: number, action: 'submit' | 'approve' | 'reject' | 'offline', reason = '', snapshot: string | null = null) {
    if (!this.reviewLogRepository) return;
    await this.reviewLogRepository.create({ contentId, contentType: 'page', fromStatus, toStatus, action, reason, snapshot });
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

    if (data.kind === 2 && !data.link) throw new BadRequestError('外链地址不能为空');
    const values = { title: data.title, slug: data.slug, summary: data.summary, mdContent: data.mdContent, coverUrl: data.coverUrl, kind: data.kind, link: data.kind === 2 ? data.link : '', target: data.target, seoTitle: data.seoTitle, seoKeywords: data.seoKeywords, seoDescription: data.seoDescription, publishAt: data.publishAt, orderNum: data.orderNum, status: 0 };
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
    const fromStatus = row.status;
    const result = await row.update({ status: 1 });
    await this.logReview(row.id, fromStatus, 1, 'submit', '', this.buildSnapshot(row));
    return result;
  }
  @Transaction()
  async offline(id: string) {
    await this.lock();
    const row = await this.info(id);
    if (row.status !== 2) throw new BadRequestError('仅发布内容可以下线');
    const fromStatus = row.status;
    const result = await row.update({ status: 4 });
    await this.logReview(row.id, fromStatus, 4, 'offline', '', this.buildSnapshot(row));
    return result;
  }
  @Transaction()
  async review(id: string, input: CmsReviewDto) {
    const data = validateCms<CmsReviewDto>(reviewSchema, input);
    await this.lock();
    const row = await this.info(id);
    if (row.status !== 1) throw new BadRequestError('仅待审核内容可以审核');
    if (!data.approve && !(data.reason ?? '').trim()) throw new BadRequestError('拒绝审核时必须填写原因');
    const nextStatus = data.approve ? 2 : 3;
    const result = await row.update({ status: nextStatus, publishAt: data.approve ? (row.publishAt ?? new Date()) : row.publishAt });
    await this.logReview(row.id, 1, nextStatus, data.approve ? 'approve' : 'reject', data.reason, this.buildSnapshot(row));
    return result;
  }
}
