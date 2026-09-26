import { InjectRepository } from '@/decorators/index.js';
import { AonCmsArticle } from '@/entities/aonCmsArticle.entity.js';
import { AonCmsBlock } from '@/entities/aonCmsBlock.entity.js';
import { AonCmsCategory } from '@/entities/aonCmsCategory.entity.js';
import { AonCmsComment } from '@/entities/aonCmsComment.entity.js';
import { AonCmsPage } from '@/entities/aonCmsPage.entity.js';
import { AonCmsTag } from '@/entities/aonCmsTag.entity.js';
import { AonCmsTopic } from '@/entities/aonCmsTopic.entity.js';
import { Inject, Provide } from '@midwayjs/core';
import { NotFoundError } from '@midwayjs/core/dist/error/http.js';
import { Context } from '@midwayjs/koa';
import { Attributes, Op, Order, WhereOptions } from '@sequelize/core';
import { CmsPublicCommentDto, publicCommentReportSchema, publicCommentSchema } from '../../../../admin/addons/cms/dto/comment.dto.js';
import { CmsQueryDto, querySchema } from '../../../../admin/addons/cms/dto/common.dto.js';
import { validateCms } from '../../../../admin/addons/cms/service/guard.js';

const articleAttributes: Array<keyof Attributes<AonCmsArticle>> = ['id', 'title', 'slug', 'summary', 'coverUrl', 'categoryId', 'topicId', 'tagIds', 'publishAt', 'seoTitle', 'seoKeywords', 'seoDescription', 'views', 'likes', 'comments', 'orderEnabled'];
@Provide()
export class AonCmsPublicService {
  @InjectRepository(AonCmsArticle) article: typeof AonCmsArticle;
  @InjectRepository(AonCmsCategory) category: typeof AonCmsCategory;
  @InjectRepository(AonCmsPage) page: typeof AonCmsPage;
  @InjectRepository(AonCmsTag) tag: typeof AonCmsTag;
  @InjectRepository(AonCmsTopic) topic: typeof AonCmsTopic;
  @InjectRepository(AonCmsBlock) block: typeof AonCmsBlock;
  @InjectRepository(AonCmsComment) comment: typeof AonCmsComment;
  @Inject() ctx: Context;

  private async visibleCategoryIds() {
    const rows = await this.category.findAll({ attributes: ['id', 'parentId', 'status'] });
    const map = new Map(rows.map((row) => [row.id, row]));
    return rows
      .filter((row) => {
        let current: typeof row | undefined = row;
        const seen = new Set<string>();
        while (current) {
          if (current.status !== 1 || seen.has(current.id)) return false;
          seen.add(current.id);
          if (!current.parentId) return true;
          current = map.get(current.parentId);
        }
        return false;
      })
      .map((row) => row.id);
  }
  private async visibleArticles(): Promise<NonNullable<WhereOptions<Attributes<AonCmsArticle>>>> {
    return { status: 2, publishAt: { [Op.lte]: new Date() }, [Op.or]: [{ categoryId: null }, { categoryId: { [Op.in]: await this.visibleCategoryIds() } }] };
  }
  private async descendantCategoryIds(categoryId: string) {
    const rows = await this.category.findAll({ attributes: ['id', 'parentId', 'status'] });
    const children = new Map<string, string[]>();
    for (const row of rows) {
      if (!row.parentId) continue;
      const siblings = children.get(row.parentId) ?? [];
      siblings.push(row.id);
      children.set(row.parentId, siblings);
    }
    const result: string[] = [];
    const queue = [categoryId];
    const seen = new Set<string>();
    while (queue.length) {
      const current = queue.shift()!;
      if (seen.has(current)) continue;
      seen.add(current);
      const row = rows.find((item) => item.id === current);
      if (!row || row.status !== 1) continue;
      result.push(current);
      queue.push(...(children.get(current) ?? []));
    }
    return result;
  }
  private articleOrder(sortBy: CmsQueryDto['sortBy']): Order {
    const metric = sortBy === 'likes' ? 'likes' : sortBy === 'comments' ? 'comments' : sortBy === 'views' ? 'views' : 'publishAt';
    return sortBy === 'latest' || !sortBy
      ? [
          ['orderNum', 'DESC'],
          [metric, 'DESC'],
          ['id', 'DESC'],
        ]
      : [
          [metric, 'DESC'],
          ['orderNum', 'DESC'],
          ['publishAt', 'DESC'],
          ['id', 'DESC'],
        ];
  }

  async articles(input: CmsQueryDto) {
    const q = validateCms<CmsQueryDto>(querySchema, input);
    const filter = {
      ...(q.keyword ? { [Op.or]: [{ title: { [Op.iLike]: '%' + q.keyword + '%' } }, { summary: { [Op.iLike]: '%' + q.keyword + '%' } }] } : {}),
    } as NonNullable<WhereOptions<Attributes<AonCmsArticle>>> & { categoryId?: string | { [Op.in]: string[] }; topicId?: string; tagIds?: { [Op.contains]: string[] } };
    if (q.categoryId) filter.categoryId = { [Op.in]: await this.descendantCategoryIds(q.categoryId) } as never;
    if (q.topicId) {
      if (!(await this.topic.findOne({ where: { id: q.topicId, status: 1 } }))) throw new NotFoundError('专题不存在');
      filter.topicId = q.topicId;
    }
    if (q.tagId) {
      if (!(await this.tag.findOne({ where: { id: q.tagId, status: 1 } }))) throw new NotFoundError('标签不存在');
      filter.tagIds = { [Op.contains]: [q.tagId] };
    }
    const { rows, count } = await this.article.findAndCountAll({
      attributes: articleAttributes,
      where: { [Op.and]: [await this.visibleArticles(), filter] },
      limit: q.pageSize,
      offset: (q.page - 1) * q.pageSize,
      order: this.articleOrder(q.sortBy),
    });
    return { list: rows, total: count, page: q.page, pageSize: q.pageSize };
  }
  async articleDetail(slug: string) {
    const row = await this.article.findOne({ attributes: [...articleAttributes, 'mdContent'], where: { [Op.and]: [await this.visibleArticles(), { slug }] } });
    if (!row) throw new NotFoundError('内容不存在');
    return row;
  }
  async pageDetail(slug: string) {
    const row = await this.page.findOne({ attributes: ['title', 'slug', 'mdContent', 'summary', 'coverUrl', 'kind', 'link', 'target', 'publishAt', 'seoTitle', 'seoKeywords', 'seoDescription'], where: { slug, status: 2, publishAt: { [Op.lte]: new Date() } } });
    if (!row) throw new NotFoundError('内容不存在');
    return row;
  }
  async navigation() {
    const [categories, tags, topics, pages] = await Promise.all([
      this.category.getTree({ attributes: ['id', 'title', 'slug', 'parentId'], where: { id: { [Op.in]: await this.visibleCategoryIds() } }, order: [['orderNum', 'DESC']] }),
      this.tag.findAll({ attributes: ['id', 'title', 'slug'], where: { status: 1 }, limit: 100, order: [['orderNum', 'DESC']] }),
      this.topic.findAll({ attributes: ['id', 'title', 'slug', 'summary', 'coverUrl'], where: { status: 1 }, limit: 100, order: [['orderNum', 'DESC']] }),
      this.page.findAll({ attributes: ['title', 'slug', 'kind', 'link', 'target'], where: { status: 2, publishAt: { [Op.lte]: new Date() } }, limit: 100, order: [['orderNum', 'DESC']] }),
    ]);
    return { categories, tags, topics, pages };
  }
  async topicDetail(slug: string) {
    const row = await this.topic.findOne({ attributes: ['id', 'title', 'slug', 'summary', 'coverUrl', 'mdContent'], where: { slug, status: 1 } });
    if (!row) throw new NotFoundError('专题不存在');
    return row;
  }
  async blocks(position: string) {
    const now = new Date();
    return this.block.findAll({
      attributes: ['id', 'title', 'kind', 'mdContent', 'coverUrl', 'link'],
      where: { position, status: 1, [Op.and]: [{ [Op.or]: [{ startAt: null }, { startAt: { [Op.lte]: now } }] }, { [Op.or]: [{ endAt: null }, { endAt: { [Op.gt]: now } }] }] },
      order: [
        ['orderNum', 'DESC'],
        ['id', 'DESC'],
      ],
      limit: 50,
    });
  }
  async comments(slug: string, input: CmsQueryDto) {
    const q = validateCms<CmsQueryDto>(querySchema, input);
    const article = await this.articleDetail(slug);
    const rows = await this.comment.findAll({
      attributes: ['id', 'userId', 'author', 'authorAvatar', 'content', 'parentId', 'createdAt', 'left', 'right', 'reportCount'],
      where: { articleId: article.id, status: 1 },
      order: [
        ['left', 'ASC'],
        ['createdAt', 'ASC'],
        ['id', 'ASC'],
      ],
    });
    return { list: rows, total: rows.length, page: q.page, pageSize: q.pageSize };
  }

  async createComment(slug: string, input: CmsPublicCommentDto) {
    const data = validateCms<CmsPublicCommentDto>(publicCommentSchema, input);
    const article = await this.articleDetail(slug);
    if (data.parentId) {
      const parent = await this.comment.findOne({ where: { id: data.parentId, articleId: article.id, status: 1 } });
      if (!parent) throw new NotFoundError('回复目标不存在');
    }
    const user = this.ctx.userInfo!;
    return this.comment.create({
      articleId: article.id,
      userId: user.id,
      author: user.nickname?.trim() || user.username,
      authorAvatar: user.avatar?.url || '',
      content: data.content,
      parentId: data.parentId || null,
      status: 0,
      reportCount: 0,
      reportReason: '',
    } as never);
  }

  async reportComment(slug: string, id: string, input: { reason: string }) {
    const data = validateCms<{ reason: string }>(publicCommentReportSchema, input);
    const article = await this.articleDetail(slug);
    const comment = await this.comment.findOne({ where: { id, articleId: article.id, status: 1 } });
    if (!comment) throw new NotFoundError('评论不存在');
    await comment.update({ reportCount: (comment.reportCount ?? 0) + 1, reportReason: data.reason, reportedAt: new Date() });
    return { reported: true };
  }
}
