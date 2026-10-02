import { InjectRepository, Transaction } from '@/decorators/index.js';
import { AonCmsArticle } from '@/entities/aonCmsArticle.entity.js';
import { AonCmsCategory } from '@/entities/aonCmsCategory.entity.js';
import { AonCmsComment } from '@/entities/aonCmsComment.entity.js';
import { AonCmsOrder } from '@/entities/aonCmsOrder.entity.js';
import { AonCmsReviewLog } from '@/entities/aonCmsReviewLog.entity.js';
import { AonCmsTag } from '@/entities/aonCmsTag.entity.js';
import { AonCmsTopic } from '@/entities/aonCmsTopic.entity.js';
import { SystemAdmin } from '@/entities/systemAdmin.entity.js';
import { Provide } from '@midwayjs/core';
import { BadRequestError, NotFoundError } from '@midwayjs/core/dist/error/http.js';
import { Attributes, col, fn, literal, Op, WhereOptions } from '@sequelize/core';
import { AonCmsArticleSaveDto, articleSchema } from '../dto/article.dto.js';
import { CmsQueryDto, CmsReviewDto, querySchema, reviewSchema } from '../dto/common.dto.js';
import { canSubmitCms, cmsId, validateCms } from './guard.js';

@Provide()
export class AonCmsArticleService {
  @InjectRepository(AonCmsArticle) repository: typeof AonCmsArticle;
  @InjectRepository(AonCmsCategory) categoryRepository: typeof AonCmsCategory;
  @InjectRepository(AonCmsTopic) topicRepository: typeof AonCmsTopic;
  @InjectRepository(AonCmsTag) tagRepository: typeof AonCmsTag;
  @InjectRepository(AonCmsComment) commentRepository: typeof AonCmsComment;
  @InjectRepository(AonCmsOrder) orderRepository: typeof AonCmsOrder;
  @InjectRepository(AonCmsReviewLog) reviewLogRepository: typeof AonCmsReviewLog;
  @InjectRepository(SystemAdmin) adminRepository: typeof SystemAdmin;
  async list(input: CmsQueryDto) {
    const q = validateCms<CmsQueryDto>(querySchema, input);
    const where: WhereOptions<Attributes<AonCmsArticle>> = {};
    if (q.keyword) where.title = { [Op.iLike]: '%' + q.keyword + '%' };
    if (q.status !== undefined) where.status = q.status;
    if (q.categoryId) where.categoryId = q.categoryId;
    if (q.topicId) where.topicId = q.topicId;
    if (q.tagId) where.tagIds = { [Op.contains]: [q.tagId] };
    if (q.isDownload !== undefined) where.isDownload = q.isDownload;
    // 后台内容类型筛选：下载 / 可下单 / 普通
    if (q.type === 'download') where.isDownload = true;
    if (q.type === 'order') where.orderEnabled = true;
    if (q.type === 'normal') {
      where.isDownload = false;
      where.orderEnabled = false;
    }

    const order = this.buildOrder(q.orderBy, q.orderDirection);
    const { rows, count } = await this.repository.findAndCountAll({
      where,
      offset: (q.page - 1) * q.pageSize,
      limit: q.pageSize,
      order,
    });

    // 关联查询每篇文章的下单数量，便于后台展示与排序校验。
    let list = rows.map((row) => row.toJSON() as Record<string, unknown> & { id: string; categoryId?: string; topicId?: string; tagIds?: string[] });
    if (rows.length) {
      const counts = (await this.orderRepository.findAll({
        where: { articleId: { [Op.in]: rows.map((row) => row.id) } },
        attributes: ['articleId', [fn('COUNT', col('id')), 'cnt']],
        group: ['articleId'],
        raw: true,
      })) as unknown as Array<{ articleId: string; cnt: number }>;
      const map = new Map(counts.map((c) => [c.articleId, Number(c.cnt)]));

      const catIds = [...new Set(rows.map((r) => r.categoryId).filter(Boolean))] as string[];
      const topicIds = [...new Set(rows.map((r) => r.topicId).filter(Boolean))] as string[];
      const tagIdSet = new Set<string>();
      rows.forEach((r) => (r.tagIds || []).forEach((t) => tagIdSet.add(t)));
      const [cats, topics, tags] = await Promise.all([
        catIds.length ? this.categoryRepository.findAll({ where: { id: { [Op.in]: catIds } } }) : [],
        topicIds.length ? this.topicRepository.findAll({ where: { id: { [Op.in]: topicIds } } }) : [],
        tagIdSet.size ? this.tagRepository.findAll({ where: { id: { [Op.in]: [...tagIdSet] } } }) : [],
      ]);
      const catMap = new Map(cats.map((c) => [c.id, c.title]));
      const topicMap = new Map(topics.map((t) => [t.id, t.title]));
      const tagMap = new Map(tags.map((t) => [t.id, t.title]));

      list = list.map((row) => ({
        ...row,
        orderCount: map.get(row.id) ?? 0,
        categoryTitle: row.categoryId ? (catMap.get(row.categoryId) ?? '') : '',
        topicTitle: row.topicId ? (topicMap.get(row.topicId) ?? '') : '',
        tagTitles: (row.tagIds || []).map((id) => tagMap.get(id)).filter(Boolean),
      }));
    }
    return { list, total: count, page: q.page, pageSize: q.pageSize };
  }
  // 后台列表排序：orders 通过子查询聚合，其余为文章列直接排序。
  private buildOrder(orderBy?: string, direction: 'asc' | 'desc' = 'desc') {
    const dir = direction === 'asc' ? 'ASC' : 'DESC';
    if (orderBy === 'orders') {
      return [literal('(SELECT COUNT(*) FROM meadmin.aon_cms_order WHERE meadmin.aon_cms_order.article_id = "AonCmsArticle".id)'), dir as any];
    }
    const column = (['createdAt', 'views', 'likes', 'comments', 'downloads'] as const).includes(orderBy as any) ? (orderBy as string) : 'createdAt';
    return [[column, dir] as [string, string], ['id', 'DESC'] as [string, string]];
  }
  async info(id: string) {
    const row = await this.repository.findByPk(cmsId(id));
    if (!row) throw new NotFoundError('CMS 记录不存在');
    return row;
  }
  // 详情：在原始记录基础上补齐栏目/专题/标签标题与下单数，供后台详情、审核弹窗完整展示
  async detail(id: string) {
    const row = await this.info(id);
    return this.enrich(row);
  }
  // 补齐关联标题与统计，避免前端二次请求
  private async enrich(row: AonCmsArticle) {
    const data = row.toJSON() as Record<string, unknown> & { id: string; categoryId?: string | null; topicId?: string | null; tagIds?: string[] };
    const [category, topic, tags, orderCount] = await Promise.all([
      data.categoryId ? this.categoryRepository.findByPk(data.categoryId) : null,
      data.topicId ? this.topicRepository.findByPk(data.topicId) : null,
      data.tagIds?.length ? this.tagRepository.findAll({ where: { id: { [Op.in]: data.tagIds } } }) : [],
      this.orderRepository.count({ where: { articleId: row.id } }),
    ]);
    return {
      ...data,
      categoryTitle: category?.title ?? '',
      topicTitle: topic?.title ?? '',
      tagTitles: tags.map((tag) => tag.title),
      orderCount,
    };
  }
  // 审核快照：记录操作当时的完整内容信息（名称、摘要、是否可下载等），便于历史回溯
  private buildSnapshot(row: AonCmsArticle) {
    return JSON.stringify({
      title: row.title,
      slug: row.slug,
      summary: row.summary,
      coverUrl: row.coverUrl,
      seoTitle: row.seoTitle,
      seoKeywords: row.seoKeywords,
      seoDescription: row.seoDescription,
      publishAt: row.publishAt,
      orderNum: row.orderNum,
      categoryId: row.categoryId,
      topicId: row.topicId,
      tagIds: row.tagIds ?? [],
      orderEnabled: row.orderEnabled,
      isDownload: row.isDownload,
      fileUrl: row.fileUrl,
      fileName: row.fileName,
      isGallery: row.isGallery,
      mdContent: row.mdContent,
    });
  }
  async reviewHistory(id: string) {
    const rows = await this.reviewLogRepository.findAll({ where: { contentType: 'article', contentId: cmsId(id) }, order: [['createdAt', 'DESC'], ['id', 'DESC']] });
    const adminIds = [...new Set(rows.map((row) => row.createdAdminId).filter(Boolean))] as string[];
    const admins = adminIds.length ? await this.adminRepository.findAll({ where: { id: { [Op.in]: adminIds } } }) : [];
    const adminMap = new Map(admins.map((admin) => [admin.id, admin.nickname || admin.username]));
    return rows.map((row) => ({ ...row.toJSON(), createdAdminName: row.createdAdminId ? (adminMap.get(row.createdAdminId) ?? '') : '' }));
  }
  private async logReview(contentId: string, fromStatus: number, toStatus: number, action: 'submit' | 'approve' | 'reject' | 'offline', reason = '', snapshot: string | null = null) {
    if (!this.reviewLogRepository) return;
    await this.reviewLogRepository.create({ contentId, contentType: 'article', fromStatus, toStatus, action, reason, snapshot });
  }
  // 所有 CMS 写入共用事务锁，保证树移动、引用检查与删除之间不出现并发穿透。
  private async lock() {
    await this.repository.sequelize.query('SELECT pg_advisory_xact_lock(82026, 920)');
  }
  @Transaction()
  async save(id: string | undefined, input: AonCmsArticleSaveDto) {
    const data = validateCms<AonCmsArticleSaveDto>(articleSchema, input);
    await this.lock();
    const row = id ? await this.info(id) : null;
    const duplicate = await this.repository.findOne({ where: { slug: data.slug, ...(id ? { id: { [Op.ne]: id } } : {}) } });
    if (duplicate) throw new BadRequestError('SEO 标识已存在');

    if (data.categoryId && !(await this.categoryRepository.findByPk(data.categoryId))) throw new BadRequestError('栏目不存在');
    if (data.topicId && !(await this.topicRepository.findByPk(data.topicId))) throw new BadRequestError('专题不存在');
    if (data.tagIds.length && (await this.tagRepository.count({ where: { id: { [Op.in]: data.tagIds } } })) !== data.tagIds.length) throw new BadRequestError('标签不存在');

    const values = { title: data.title, slug: data.slug, summary: data.summary, mdContent: data.mdContent, coverUrl: data.coverUrl, seoTitle: data.seoTitle, seoKeywords: data.seoKeywords, seoDescription: data.seoDescription, publishAt: data.publishAt, orderNum: data.orderNum, categoryId: data.categoryId, topicId: data.topicId, tagIds: data.tagIds, orderEnabled: data.orderEnabled, isDownload: data.isDownload, fileUrl: data.fileUrl, fileName: data.fileName, isGallery: data.isGallery, status: 0, views: 0, likes: 0, comments: 0 };
    if (!row) return this.repository.create(values);
    return row.update(values);
  }
  @Transaction()
  async remove(id: string) {
    await this.lock();
    const row = await this.info(id);

    if (await this.commentRepository.count({ where: { articleId: row.id } })) throw new BadRequestError('文章存在关联评论，请先删除评论');
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
