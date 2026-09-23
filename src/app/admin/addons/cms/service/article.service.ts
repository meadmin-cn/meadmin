import { InjectRepository, Transaction } from '@/decorators/index.js';
import { AonCmsArticle } from '@/entities/aonCmsArticle.entity.js';
import { AonCmsCategory } from '@/entities/aonCmsCategory.entity.js';
import { AonCmsComment } from '@/entities/aonCmsComment.entity.js';
import { AonCmsTag } from '@/entities/aonCmsTag.entity.js';
import { AonCmsTopic } from '@/entities/aonCmsTopic.entity.js';
import { Provide } from '@midwayjs/core';
import { BadRequestError, NotFoundError } from '@midwayjs/core/dist/error/http.js';
import { Attributes, Op, WhereOptions } from '@sequelize/core';
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
  async list(input: CmsQueryDto) {
    const q = validateCms<CmsQueryDto>(querySchema, input);
    const where: WhereOptions<Attributes<AonCmsArticle>> = {};
    if (q.keyword) where.title = { [Op.iLike]: '%' + q.keyword + '%' };
    if (q.status !== undefined) where.status = q.status;
    if (q.categoryId) where.categoryId = q.categoryId;
    if (q.topicId) where.topicId = q.topicId;
    if (q.tagId) where.tagIds = { [Op.contains]: [q.tagId] };

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
  async save(id: string | undefined, input: AonCmsArticleSaveDto) {
    const data = validateCms<AonCmsArticleSaveDto>(articleSchema, input);
    await this.lock();
    const row = id ? await this.info(id) : null;
    const duplicate = await this.repository.findOne({ where: { slug: data.slug, ...(id ? { id: { [Op.ne]: id } } : {}) } });
    if (duplicate) throw new BadRequestError('SEO 标识已存在');

    if (data.categoryId && !(await this.categoryRepository.findByPk(data.categoryId))) throw new BadRequestError('栏目不存在');
    if (data.topicId && !(await this.topicRepository.findByPk(data.topicId))) throw new BadRequestError('专题不存在');
    if (data.tagIds.length && (await this.tagRepository.count({ where: { id: { [Op.in]: data.tagIds } } })) !== data.tagIds.length) throw new BadRequestError('标签不存在');

    const values = { title: data.title, slug: data.slug, summary: data.summary, mdContent: data.mdContent, coverUrl: data.coverUrl, seoTitle: data.seoTitle, seoKeywords: data.seoKeywords, seoDescription: data.seoDescription, publishAt: data.publishAt, orderNum: data.orderNum, categoryId: data.categoryId, topicId: data.topicId, tagIds: data.tagIds, orderEnabled: data.orderEnabled, status: 0, views: 0, likes: 0, comments: 0 };
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
