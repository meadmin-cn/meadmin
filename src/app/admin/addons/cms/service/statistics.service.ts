import { InjectRepository, Transaction } from '@/decorators/index.js';
import { AonCmsArticle } from '@/entities/aonCmsArticle.entity.js';
import { AonCmsBlock } from '@/entities/aonCmsBlock.entity.js';
import { AonCmsCategory } from '@/entities/aonCmsCategory.entity.js';
import { AonCmsComment } from '@/entities/aonCmsComment.entity.js';
import { AonCmsPage } from '@/entities/aonCmsPage.entity.js';
import { AonCmsTag } from '@/entities/aonCmsTag.entity.js';
import { AonCmsTopic } from '@/entities/aonCmsTopic.entity.js';
import { Provide } from '@midwayjs/core';
import { IsolationLevel, Op } from '@sequelize/core';

@Provide()
export class AonCmsStatisticsService {
  @InjectRepository(AonCmsArticle) article: typeof AonCmsArticle;
  @InjectRepository(AonCmsCategory) category: typeof AonCmsCategory;
  @InjectRepository(AonCmsTag) tag: typeof AonCmsTag;
  @InjectRepository(AonCmsTopic) topic: typeof AonCmsTopic;
  @InjectRepository(AonCmsPage) page: typeof AonCmsPage;
  @InjectRepository(AonCmsBlock) block: typeof AonCmsBlock;
  @InjectRepository(AonCmsComment) comment: typeof AonCmsComment;

  @Transaction({ options: { isolationLevel: IsolationLevel.REPEATABLE_READ } })
  async summary() {
    const now = new Date();
    const [article, category, tag, topic, page, block, comment, pendingArticles, pendingComments, published, scheduled] = await Promise.all([
      this.article.count(),
      this.category.count(),
      this.tag.count(),
      this.topic.count(),
      this.page.count(),
      this.block.count(),
      this.comment.count(),
      this.article.count({ where: { status: 1 } }),
      this.comment.count({ where: { status: 0 } }),
      this.article.count({ where: { status: 2, publishAt: { [Op.lte]: now } } }),
      this.article.count({ where: { status: 2, publishAt: { [Op.gt]: now } } }),
    ]);
    const trends = [];
    // 日期边界明确使用 UTC；不读取正文，也不把固定示例伪装成真实趋势。
    for (let i = 13; i >= 0; i--) {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
      const end = new Date(start.getTime() + 86400000);
      const [articles, comments] = await Promise.all([this.article.count({ where: { createdAt: { [Op.gte]: start, [Op.lt]: end } } }), this.comment.count({ where: { createdAt: { [Op.gte]: start, [Op.lt]: end } } })]);
      trends.push({ date: start.toISOString().slice(0, 10), articles, comments });
    }
    return { counts: { article, category, tag, topic, page, block, comment, pendingArticles, pendingComments, published, scheduled }, trends, timezone: 'UTC', generatedAt: now };
  }
}
