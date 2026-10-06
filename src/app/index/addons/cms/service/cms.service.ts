import { InjectRepository } from '@/decorators/index.js';
import { AonCmsArticle } from '@/entities/aonCmsArticle.entity.js';
import { AonCmsBlock } from '@/entities/aonCmsBlock.entity.js';
import { AonCmsCategory } from '@/entities/aonCmsCategory.entity.js';
import { AonCmsComment } from '@/entities/aonCmsComment.entity.js';
import { AonCmsCommentReport } from '@/entities/aonCmsCommentReport.entity.js';
import { AonCmsDiyform } from '@/entities/aonCmsDiyform.entity.js';
import { AonCmsPage } from '@/entities/aonCmsPage.entity.js';
import { AonCmsTag } from '@/entities/aonCmsTag.entity.js';
import { AonCmsTopic } from '@/entities/aonCmsTopic.entity.js';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError, NotFoundError } from '@midwayjs/core/dist/error/http.js';
import { Context } from '@midwayjs/koa';
import { Attributes, Op, Order, WhereOptions } from '@sequelize/core';
import { CmsPublicCommentDto, publicCommentReportSchema, publicCommentSchema } from '../../../../admin/addons/cms/dto/comment.dto.js';
import { CmsQueryDto, querySchema } from '../../../../admin/addons/cms/dto/common.dto.js';
import { validateCms } from '../../../../admin/addons/cms/service/guard.js';

const articleAttributes: Array<keyof Attributes<AonCmsArticle>> = ['id', 'title', 'slug', 'summary', 'coverUrl', 'categoryId', 'topicId', 'tagIds', 'publishAt', 'seoTitle', 'seoKeywords', 'seoDescription', 'views', 'likes', 'comments', 'orderEnabled', 'isDownload', 'fileUrl', 'fileName', 'downloads', 'isGallery'];
@Provide()
export class AonCmsPublicService {
  @InjectRepository(AonCmsArticle) article: typeof AonCmsArticle;
  @InjectRepository(AonCmsCategory) category: typeof AonCmsCategory;
  @InjectRepository(AonCmsPage) page: typeof AonCmsPage;
  @InjectRepository(AonCmsTag) tag: typeof AonCmsTag;
  @InjectRepository(AonCmsTopic) topic: typeof AonCmsTopic;
  @InjectRepository(AonCmsDiyform) diyform: typeof AonCmsDiyform;
  @InjectRepository(AonCmsBlock) block: typeof AonCmsBlock;
  @InjectRepository(AonCmsComment) comment: typeof AonCmsComment;
  @InjectRepository(AonCmsCommentReport) commentReport: typeof AonCmsCommentReport;
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
  async downloadArticle(slug: string) {
    const row = await this.article.findOne({ attributes: [...articleAttributes, 'mdContent'], where: { [Op.and]: [await this.visibleArticles(), { slug }] } });
    if (!row) throw new NotFoundError('内容不存在');
    if (!row.isDownload || !row.fileUrl) throw new BadRequestError('该内容不可下载');
    await row.increment('downloads', { by: 1 });
    return { url: row.fileUrl, title: row.fileName || row.title, downloads: (row.downloads ?? 0) + 1 };
  }
  async pageDetail(slug: string) {
    const row = await this.page.findOne({ attributes: ['title', 'slug', 'mdContent', 'summary', 'coverUrl', 'kind', 'link', 'target', 'publishAt', 'seoTitle', 'seoKeywords', 'seoDescription'], where: { slug, status: 2, publishAt: { [Op.lte]: new Date() } } });
    if (!row) throw new NotFoundError('内容不存在');
    return row;
  }
  async navigation(): Promise<{
    categories: unknown;
    tags: unknown;
    topics: Array<{ id: string; title: string; slug: string; summary: string; coverUrl: string; type: number; link: string; openMode: number }>;
    pages: unknown;
  }> {
    const [categories, tags, topicRows, pages, diyforms] = await Promise.all([
      this.category.getTree({ attributes: ['id', 'title', 'slug', 'parentId', 'type', 'linkUrl', 'target', 'isNav', 'isRecommend', 'coverUrl'], where: { id: { [Op.in]: await this.visibleCategoryIds() } }, order: [['orderNum', 'DESC']] }),
      this.tag.findAll({ attributes: ['id', 'title', 'slug', 'isHot'], where: { status: 1 }, limit: 100, order: [['orderNum', 'DESC']] }),
      this.topic.findAll({ attributes: ['id', 'title', 'slug', 'summary', 'coverUrl', 'type', 'target', 'targetBlank'], where: { status: 1 }, limit: 100, order: [['orderNum', 'DESC']] }),
      this.page.findAll({ attributes: ['id', 'title', 'slug', 'kind', 'link', 'target'], where: { status: 2, publishAt: { [Op.lte]: new Date() } }, limit: 100, order: [['orderNum', 'DESC']] }),
      this.diyform.findAll({ attributes: ['id', 'diyname', 'status'], where: { status: 1 }, limit: 100 }),
    ]);
    // 预建 id→标识映射，避免在栏目树递归中逐条查库
    const pageMap = new Map(pages.map((p) => [p.id, p]));
    const diyMap = new Map(diyforms.map((d) => [d.id, d]));
    // 栏目跳转解析：1/2 文章列表/目录→栏目聚合页；3 外链→linkUrl 新窗口；4 自定义表单→/aon/cms/form/:diyname；5 单页→/aon/cms/page/:slug
    const categoryLink = (cat: { type: number; linkUrl?: string; target?: string; slug?: string }): string => {
      if (cat.type === 3) return cat.linkUrl || '';
      if (cat.type === 4) {
        const f = diyMap.get(cat.target ?? '');
        return f ? `/aon/cms/form/${f.diyname}` : '';
      }
      if (cat.type === 5) {
        const p = pageMap.get(cat.target ?? '');
        return p ? `/aon/cms/page/${p.slug}` : '';
      }
      return `/aon/cms/category/${cat.slug}`;
    };
    const decorate = (list: any[]): any[] =>
      list.map((cat) => {
        const plain = cat.get ? cat.get({ plain: true }) : cat;
        const link = categoryLink(plain);
        return {
          ...plain,
          link,
          openMode: plain.type === 3 ? 1 : 0,
          children: cat.children && cat.children.length ? decorate(cat.children) : undefined,
        };
      });
    // 解析每个专题的前台落地地址，导航菜单按类型直接指向文章/表单/栏目/单页或外链
    const topics = await Promise.all(
      topicRows.map(async (t) => {
        const { link } = await this.resolveTopicLink(t.type, t.target);
        return { id: t.id, title: t.title, slug: t.slug, summary: t.summary, coverUrl: t.coverUrl, type: t.type, link, openMode: t.type === 2 ? t.targetBlank : 0 };
      }),
    );
    return { categories: decorate(categories), tags, topics, pages };
  }
  // 专题内容类型解析：将 type + target 解析为前台落地地址，供前台跳转与导航菜单使用。
  // type: 1内置内容(返回空，前端渲染本页 Markdown) 2外链 3文章 4自定义表单 5目录 6单页
  private async resolveTopicLink(type: number, target: string): Promise<{ link: string; openMode: number }> {
    if (type === 2) return { link: target || '', openMode: 0 };
    if (type === 3) {
      const article = await this.article.findOne({ attributes: ['slug', 'status'], where: { id: target } });
      if (article && article.status === 2) return { link: `/aon/cms/article/${article.slug}`, openMode: 0 };
    } else if (type === 4) {
      const form = await this.diyform.findOne({ attributes: ['diyname', 'status'], where: { id: target } });
      if (form && form.status === 1) return { link: `/aon/cms/form/${form.diyname}`, openMode: 0 };
    } else if (type === 5) {
      const category = await this.category.findOne({ attributes: ['slug', 'status'], where: { id: target } });
      if (category && category.status === 1) return { link: `/aon/cms/category/${category.slug}`, openMode: 0 };
    } else if (type === 6) {
      const page = await this.page.findOne({ attributes: ['slug', 'status'], where: { id: target } });
      if (page && page.status === 2) return { link: `/aon/cms/page/${page.slug}`, openMode: 0 };
    }
    return { link: '', openMode: 0 };
  }
  async topicDetail(slug: string) {
    const row = await this.topic.findOne({ where: { slug, status: 1 } });
    if (!row) throw new NotFoundError('专题不存在');
    const plain = row.get({ plain: true }) as Record<string, unknown> & { type: number; target: string; targetBlank: number };
    const { link } = await this.resolveTopicLink(plain.type, plain.target);
    return { ...plain, link, openMode: plain.type === 2 ? plain.targetBlank : 0 };
  }
  // 首页聚合数据：热门标签、推荐栏目、图集精选、热门排行（规则来自区块配置）。
  async home() {
    const visible = await this.visibleArticles();
    const [hotTags, recommendCategories, gallery, rankingBlock] = await Promise.all([
      this.tag.findAll({
        attributes: ['id', 'title', 'slug', 'isHot'],
        where: { isHot: true, status: 1 },
        order: [
          ['orderNum', 'DESC'],
          ['id', 'ASC'],
        ],
        limit: 30,
      }),
      this.category.findAll({
        attributes: ['id', 'title', 'slug', 'coverUrl', 'isRecommend'],
        where: { isRecommend: true, status: 1 },
        order: [
          ['orderNum', 'DESC'],
          ['id', 'ASC'],
        ],
        limit: 30,
      }),
      this.article.findAll({ attributes: articleAttributes, where: { ...visible, isGallery: true }, order: this.articleOrder('latest'), limit: 8 }),
      this.block.findOne({ where: { position: 'home-ranking', kind: 1, status: 1 } }),
    ]);
    const rule: { sortBy: NonNullable<CmsQueryDto['sortBy']>; limit: number } = { sortBy: 'views', limit: 6 };
    if (rankingBlock?.config) {
      try {
        const parsed = JSON.parse(rankingBlock.config) as { sortBy?: string; limit?: number };
        if (parsed.sortBy && ['latest', 'likes', 'comments', 'views'].includes(parsed.sortBy)) rule.sortBy = parsed.sortBy as NonNullable<CmsQueryDto['sortBy']>;
        if (typeof parsed.limit === 'number' && parsed.limit > 0 && parsed.limit <= 50) rule.limit = Math.floor(parsed.limit);
      } catch {
        // 忽略非法 JSON，使用默认规则
      }
    }
    const ranking = await this.article.findAndCountAll({ attributes: articleAttributes, where: visible, order: this.articleOrder(rule.sortBy), limit: rule.limit });
    return { hotTags, recommendCategories, gallery, ranking: ranking.rows, rankingRule: rule };
  }
  // 内容详情相关推荐：同栏目或共享标签，排除自身。
  async relatedArticles(slug: string) {
    const article = await this.articleDetail(slug);
    const conditions: Record<string, unknown>[] = [];
    if (article.categoryId) conditions.push({ categoryId: article.categoryId });
    if ((article.tagIds ?? []).length) conditions.push({ tagIds: { [Op.overlap]: article.tagIds } });
    if (!conditions.length) return [];
    const rows = await this.article.findAll({
      attributes: articleAttributes,
      where: { ...(await this.visibleArticles()), id: { [Op.ne]: article.id }, [Op.or]: conditions },
      order: this.articleOrder('views'),
      limit: 6,
    });
    return rows;
  }
  async blocks(position: string) {
    const now = new Date();
    return this.block.findAll({
      attributes: ['id', 'title', 'displayTitle', 'kind', 'mdContent', 'coverUrl', 'link'],
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
    const attributes: Array<keyof Attributes<AonCmsComment>> = ['id', 'userId', 'author', 'authorAvatar', 'content', 'parentId', 'createdAt', 'left', 'right', 'reportCount'];
    const rootWhere = { articleId: article.id, status: 1, parentId: null };
    const total = await this.comment.count({ where: rootWhere });
    const roots = await this.comment.findAll({
      attributes,
      where: rootWhere,
      limit: q.pageSize,
      offset: (q.page - 1) * q.pageSize,
      order: [
        ['left', 'ASC'],
        ['createdAt', 'ASC'],
        ['id', 'ASC'],
      ],
    });
    if (!roots.length) return { list: [], total, page: q.page, pageSize: q.pageSize };

    const hasTreeBounds = roots.every((root) => Number.isFinite(root.left) && Number.isFinite(root.right));
    const rows = hasTreeBounds
      ? await this.comment.findAll({
          attributes,
          where: {
            articleId: article.id,
            status: 1,
            [Op.or]: roots.map((root) => ({ left: { [Op.gte]: root.left }, right: { [Op.lte]: root.right } })),
          },
          order: [
            ['left', 'ASC'],
            ['createdAt', 'ASC'],
            ['id', 'ASC'],
          ],
        })
      : await this.comment.findAll({
          attributes,
          where: { articleId: article.id, status: 1 },
          order: [
            ['createdAt', 'ASC'],
            ['id', 'ASC'],
          ],
        });
    const rootIds = new Set(roots.map((root) => root.id));
    const children = new Map<string, string[]>();
    for (const row of rows) {
      if (!row.parentId) continue;
      children.set(row.parentId, [...(children.get(row.parentId) ?? []), row.id]);
    }
    const included = new Set<string>();
    const queue = [...rootIds];
    while (queue.length) {
      const id = queue.shift()!;
      if (included.has(id)) continue;
      included.add(id);
      queue.push(...(children.get(id) ?? []));
    }
    return { list: rows.filter((row) => included.has(row.id)), total, page: q.page, pageSize: q.pageSize };
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
    const user = this.ctx.userInfo!;
    await this.commentReport.create({ commentId: comment.id, articleId: article.id, userId: user.id, reason: data.reason });
    await comment.increment('reportCount', { by: 1 });
    await comment.update({ reportReason: data.reason, reportedAt: new Date() });
    return { reported: true };
  }
}
