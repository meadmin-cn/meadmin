import { ApiPropertyRule } from '@/decorators/index.js';
import { RuleType } from '@/ruleType/index.js';

export class CmsQueryDto {
  @ApiPropertyRule({ rule: RuleType.number().integer().min(1).max(100000).default(1) })
  page: number;
  @ApiPropertyRule({ rule: RuleType.number().integer().min(1).max(100).default(20) })
  pageSize: number;
  @ApiPropertyRule({ rule: RuleType.string().max(100).allow('') })
  keyword?: string;
  @ApiPropertyRule({ rule: RuleType.number().integer().valid(0, 1, 2, 3, 4) })
  status?: number;
  @ApiPropertyRule({ rule: RuleType.string().pattern(/^[0-9]{1,20}$/) })
  categoryId?: string;
  @ApiPropertyRule({ rule: RuleType.string().pattern(/^[0-9]{1,20}$/) })
  topicId?: string;
  @ApiPropertyRule({ rule: RuleType.string().pattern(/^[0-9]{1,20}$/) })
  tagId?: string;
  @ApiPropertyRule({ rule: RuleType.string().pattern(/^[0-9]{1,20}$/) })
  articleId?: string;
  @ApiPropertyRule({ rule: RuleType.string().pattern(/^[0-9]{1,20}$/) })
  commentId?: string;
  // 仅筛选可下载内容（下载资源列表复用文章数据源）
  @ApiPropertyRule({ rule: RuleType.boolean() })
  isDownload?: boolean;
  // 后台内容类型筛选：download=可下载；order=可下单；normal=普通（两者皆否）
  @ApiPropertyRule({ rule: RuleType.string().valid('download', 'order', 'normal') })
  type?: 'download' | 'order' | 'normal';
  // 后台列表排序字段
  @ApiPropertyRule({ rule: RuleType.string().valid('createdAt', 'views', 'likes', 'comments', 'downloads', 'orders').default('createdAt') })
  orderBy?: 'createdAt' | 'views' | 'likes' | 'comments' | 'downloads' | 'orders';
  // 后台列表排序方向
  @ApiPropertyRule({ rule: RuleType.string().valid('asc', 'desc').default('desc') })
  orderDirection?: 'asc' | 'desc';
  // 区块展示位置筛选
  @ApiPropertyRule({ rule: RuleType.string().max(100) })
  position?: string;
  // 前台排序：latest=发布时间; likes=点赞数; comments=评论数; views=浏览量
  @ApiPropertyRule({ rule: RuleType.string().valid('latest', 'likes', 'comments', 'views').default('latest') })
  sortBy?: 'latest' | 'likes' | 'comments' | 'views';
}
export class CmsReviewDto {
  @ApiPropertyRule({ rule: RuleType.boolean().required() })
  approve: boolean;
  @ApiPropertyRule({ rule: RuleType.string().max(1000).allow('').default('') })
  reason?: string;
}

export const querySchema: ReturnType<typeof RuleType.object> = RuleType.object({
  page: RuleType.number().integer().min(1).max(100000).default(1),
  pageSize: RuleType.number().integer().min(1).max(100).default(20),
  keyword: RuleType.string().max(100).allow(''),
  status: RuleType.number().integer().valid(0, 1, 2, 3, 4),
  categoryId: RuleType.string().pattern(/^[0-9]{1,20}$/),
  topicId: RuleType.string().pattern(/^[0-9]{1,20}$/),
  tagId: RuleType.string().pattern(/^[0-9]{1,20}$/),
  articleId: RuleType.string().pattern(/^[0-9]{1,20}$/),
  commentId: RuleType.string().pattern(/^[0-9]{1,20}$/),
  isDownload: RuleType.boolean(),
  type: RuleType.string().valid('download', 'order', 'normal'),
  orderBy: RuleType.string().valid('createdAt', 'views', 'likes', 'comments', 'downloads', 'orders').default('createdAt'),
  orderDirection: RuleType.string().valid('asc', 'desc').default('desc'),
  position: RuleType.string().max(100),
  sortBy: RuleType.string().valid('latest', 'likes', 'comments', 'views').default('latest'),
}).unknown(false);
export const reviewSchema: ReturnType<typeof RuleType.object> = RuleType.object({ approve: RuleType.boolean().required(), reason: RuleType.string().max(1000).allow('').default('') }).unknown(false);
