import { InjectRepository, Transaction } from '@/decorators/index.js';
import { AonCmsArticle } from '@/entities/aonCmsArticle.entity.js';
import { AonCmsComment } from '@/entities/aonCmsComment.entity.js';
import { AonCmsCommentReport } from '@/entities/aonCmsCommentReport.entity.js';
import { AonCmsReviewLog } from '@/entities/aonCmsReviewLog.entity.js';
import { Provide } from '@midwayjs/core';
import { BadRequestError, NotFoundError } from '@midwayjs/core/dist/error/http.js';
import { Attributes, Op, WhereOptions } from '@sequelize/core';
import { AonCmsCommentSaveDto, commentSchema } from '../dto/comment.dto.js';
import { CmsQueryDto, CmsReviewDto, querySchema, reviewSchema } from '../dto/common.dto.js';
import { cmsId, validateCms } from './guard.js';

@Provide()
export class AonCmsCommentService {
  @InjectRepository(AonCmsComment) repository: typeof AonCmsComment;
  @InjectRepository(AonCmsArticle) articleRepository: typeof AonCmsArticle;
  @InjectRepository(AonCmsCommentReport) reportRepository: typeof AonCmsCommentReport;
  @InjectRepository(AonCmsReviewLog) reviewLogRepository: typeof AonCmsReviewLog;
  async list(input: CmsQueryDto) {
    const q = validateCms<CmsQueryDto>(querySchema, input);
    const where: WhereOptions<Attributes<AonCmsComment>> = {};
    if (q.keyword) where.content = { [Op.iLike]: '%' + q.keyword + '%' };
    if (q.status !== undefined) where.status = q.status;

    if (q.articleId) where.articleId = q.articleId;
    const { rows, count } = await this.repository.findAndCountAll({
      where,
      offset: (q.page - 1) * q.pageSize,
      limit: q.pageSize,
      order: q.status === 0 ? [['reportCount', 'DESC'], ['reportedAt', 'DESC'], ['createdAt', 'DESC'], ['id', 'DESC']] : [['createdAt', 'DESC'], ['id', 'DESC']],
    });
    return { list: rows, total: count, page: q.page, pageSize: q.pageSize };
  }
  async info(id: string) {
    const row = await this.repository.findByPk(cmsId(id));
    if (!row) throw new NotFoundError('CMS 记录不存在');
    return row;
  }
  async reports(input: CmsQueryDto) {
    const q = validateCms<CmsQueryDto>(querySchema, input);
    const where: WhereOptions<any> = {};
    if (q.commentId) where.commentId = q.commentId;
    const { rows, count } = await this.reportRepository.findAndCountAll({
      where,
      offset: (q.page - 1) * q.pageSize,
      limit: q.pageSize,
      order: [['createdAt', 'DESC'], ['id', 'DESC']],
    });
    return { list: rows, total: count, page: q.page, pageSize: q.pageSize };
  }
  async reviewHistory(id: string) {
    return this.reviewLogRepository.findAll({ where: { contentType: 'comment', contentId: cmsId(id) }, order: [['createdAt', 'DESC'], ['id', 'DESC']] });
  }
  private async logReview(contentId: string, fromStatus: number, toStatus: number, action: 'submit' | 'approve' | 'reject' | 'offline', reason = '') {
    if (!this.reviewLogRepository) return;
    await this.reviewLogRepository.create({ contentId, contentType: 'comment', fromStatus, toStatus, action, reason });
  }
  // 所有 CMS 写入共用事务锁，保证树移动、引用检查与删除之间不出现并发穿透。
  private async lock() {
    await this.repository.sequelize.query('SELECT pg_advisory_xact_lock(82026, 920)');
  }

  private async syncArticleCommentCount(articleId: string) {
    const comments = await this.repository.count({ where: { articleId, status: 1 } });
    await this.articleRepository.update({ comments }, { where: { id: articleId } });
  }

  @Transaction()
  async save(id: string | undefined, input: AonCmsCommentSaveDto) {
    const data = validateCms<AonCmsCommentSaveDto>(commentSchema, input);
    await this.lock();
    const row = id ? await this.info(id) : null;

    if (!(await this.articleRepository.findByPk(data.articleId))) throw new BadRequestError('文章不存在');
    if (data.parentId) {
      const parent = await this.repository.findOne({ where: { id: data.parentId, articleId: data.articleId } });
      if (!parent) throw new BadRequestError('回复目标不存在');
    }

    const values = {
      articleId: data.articleId,
      userId: row?.userId ?? '',
      author: data.author,
      authorAvatar: row?.authorAvatar ?? '',
      content: data.content,
      parentId: data.parentId || null,
      status: row?.status ?? 0,
      reportCount: row?.reportCount ?? 0,
      reportReason: row?.reportReason ?? '',
      reportedAt: row?.reportedAt ?? null,
    };
    if (!row) return this.repository.create(values);
    return row.update(values);
  }
  @Transaction()
  async remove(id: string) {
    await this.lock();
    const row = await this.info(id);
    const articleId = row.articleId;
    await row.destroy();
    await this.syncArticleCommentCount(articleId);
  }

  @Transaction()
  async review(id: string, input: CmsReviewDto) {
    const data = validateCms<CmsReviewDto>(reviewSchema, input);
    await this.lock();
    const row = await this.info(id);
    if (!data.approve && !(data.reason ?? '').trim()) throw new BadRequestError('拒绝审核时必须填写原因');
    const fromStatus = row.status;
    const nextStatus = data.approve ? 1 : 2;
    const result = await row.update({ status: nextStatus });
    await this.logReview(row.id, fromStatus, nextStatus, data.approve ? 'approve' : 'reject', data.reason);
    await this.syncArticleCommentCount(row.articleId);
    return result;
  }
}
