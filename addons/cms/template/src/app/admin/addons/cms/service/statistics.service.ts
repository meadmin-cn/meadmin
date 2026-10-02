import { InjectRepository, Transaction } from '@/decorators/index.js';
// CMS 统计：内容/评论/订单/下载/浏览多维统计（2026-09-28 增强）
import { AonCmsArticle } from '@/entities/aonCmsArticle.entity.js';
import { AonCmsBlock } from '@/entities/aonCmsBlock.entity.js';
import { AonCmsCategory } from '@/entities/aonCmsCategory.entity.js';
import { AonCmsComment } from '@/entities/aonCmsComment.entity.js';
import { AonCmsOrder } from '@/entities/aonCmsOrder.entity.js';
import { AonCmsPage } from '@/entities/aonCmsPage.entity.js';
import { AonCmsTag } from '@/entities/aonCmsTag.entity.js';
import { AonCmsTopic } from '@/entities/aonCmsTopic.entity.js';
import { Provide } from '@midwayjs/core';
import { IsolationLevel, Op } from '@sequelize/core';

export interface CmsStatisticsResult {
  counts: Record<string, number>;
  orderTotalMap: Record<string, number>;
  paidAmount: number;
  trends: Array<{ date: string; articles: number; comments: number; orders: number }>;
  categoryDistribution: Array<{ title: string; total: number }>;
  downloadRanking: Array<{ title: string; slug: string; total: number }>;
  viewRanking: Array<{ title: string; slug: string; total: number }>;
  timezone: string;
  generatedAt: Date;
}

@Provide()
export class AonCmsStatisticsService {
  @InjectRepository(AonCmsArticle) article: typeof AonCmsArticle;
  @InjectRepository(AonCmsCategory) category: typeof AonCmsCategory;
  @InjectRepository(AonCmsTag) tag: typeof AonCmsTag;
  @InjectRepository(AonCmsTopic) topic: typeof AonCmsTopic;
  @InjectRepository(AonCmsPage) page: typeof AonCmsPage;
  @InjectRepository(AonCmsBlock) block: typeof AonCmsBlock;
  @InjectRepository(AonCmsComment) comment: typeof AonCmsComment;
  @InjectRepository(AonCmsOrder) order: typeof AonCmsOrder;

  @Transaction({ options: { isolationLevel: IsolationLevel.REPEATABLE_READ } })
  async summary(): Promise<CmsStatisticsResult> {
    const now = new Date();
    const [article, category, tag, topic, page, block, comment, download, order, pendingArticles, pendingComments, published, scheduled] = await Promise.all([
      this.article.count(),
      this.category.count(),
      this.tag.count(),
      this.topic.count(),
      this.page.count(),
      this.block.count(),
      this.comment.count(),
      // 下载资源即「可下载文章」，不再单独维护资源表
      this.article.count({ where: { isDownload: true } }),
      this.order.count(),
      this.article.count({ where: { status: 1 } }),
      this.comment.count({ where: { status: 0 } }),
      this.article.count({ where: { status: 2, publishAt: { [Op.lte]: now } } }),
      this.article.count({ where: { status: 2, publishAt: { [Op.gt]: now } } }),
    ]);
    const trendRows = await this.order.findAll({
      attributes: ['status', 'paymentStatus', [this.order.sequelize.fn('COUNT', this.order.sequelize.col('id')), 'total'], [this.order.sequelize.fn('COALESCE', this.order.sequelize.fn('SUM', this.order.sequelize.col('paid_amount')), 0), 'paid']],
      group: ['status', 'paymentStatus'],
      raw: true,
    });
    const orderTotalMap: Record<string, number> = {};
    let paidAmount = 0;
    for (const r of trendRows as unknown as Array<{ status: number; paymentStatus: number; total: string; paid: string }>) {
      orderTotalMap[`s${r.status}`] = (orderTotalMap[`s${r.status}`] ?? 0) + Number(r.total);
      if (r.paymentStatus === 1) paidAmount += Number(r.paid);
    }
    paidAmount = Math.round(paidAmount * 100) / 100;

    const trends = [];
    const pad = (value: number) => String(value).padStart(2, '0');
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // 按服务器本地时区切分自然日，避免前端展示出 UTC 的“国际时间”。
    for (let i = 13; i >= 0; i--) {
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i + 1);
      const [articles, comments, orders] = await Promise.all([
        this.article.count({ where: { createdAt: { [Op.gte]: start, [Op.lt]: end } } }),
        this.comment.count({ where: { createdAt: { [Op.gte]: start, [Op.lt]: end } } }),
        this.order.count({ where: { createdAt: { [Op.gte]: start, [Op.lt]: end } } }),
      ]);
      trends.push({ date: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`, articles, comments, orders });
    }

    // 栏目文章分布（取文章数最多的前 8 个栏目）
    const catRows = (await this.article.findAll({
      attributes: ['categoryId', [this.article.sequelize.fn('COUNT', this.article.sequelize.col('id')), 'total']],
      group: ['categoryId'],
      raw: true,
    })) as unknown as Array<{ categoryId: string | null; total: string }>;
    const catIds = [...new Set(catRows.map((r) => r.categoryId).filter(Boolean))] as string[];
    const cats = catIds.length ? await this.category.findAll({ attributes: ['id', 'title'], where: { id: catIds } }) : [];
    const catTitle = new Map(cats.map((c) => [c.id, c.title]));
    const categoryDistribution = catRows
      .map((r) => ({ title: (r.categoryId && catTitle.get(r.categoryId)) || '未分类', total: Number(r.total) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    const downloadRanking = (await this.article.findAll({ attributes: ['id', 'title', 'slug', 'downloads'], where: { isDownload: true }, order: [['downloads', 'DESC']], limit: 10 })).map((d) => ({ title: d.title, slug: d.slug, total: d.downloads }));
    const viewRanking = (await this.article.findAll({ attributes: ['id', 'title', 'slug', 'views'], where: { status: 2 }, order: [['views', 'DESC']], limit: 10 })).map((a) => ({ title: a.title, slug: a.slug, total: a.views }));

    // 服务器本地时区偏移，前端据此提示“本地时间”而非国际时间。
    const offset = -now.getTimezoneOffset() / 60;
    return {
      counts: { article, category, tag, topic, page, block, comment, download, order, pendingArticles, pendingComments, published, scheduled },
      orderTotalMap,
      paidAmount,
      trends,
      categoryDistribution,
      downloadRanking,
      viewRanking,
      timezone: `UTC${offset >= 0 ? '+' : ''}${offset}`,
      generatedAt: now,
    };
  }
}
