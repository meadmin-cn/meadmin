import request from '@/utils/request';
export interface CmsContent {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverUrl: string;
  htmlContent?: string;
  publishAt?: string;
  categoryId?: string;
  topicId?: string;
  tagIds?: string[];
  views: number;
  likes: number;
  comments: number;
  orderEnabled?: boolean;
  isDownload?: boolean;
  fileUrl?: string;
  fileName?: string;
  downloads?: number;
  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;
  /** 单页类型：1站内内容，2外部链接 */
  kind?: number;
  link?: string;
  target?: number;
  /** 专题内容类型（仅 kind=topic 时有效）：1内置内容 2外链 3文章 4自定义表单 5目录 6单页 */
  type?: number;
  /** 专题解析后的前台落地地址（仅 kind=topic 且 type≠1 时非空） */
  /** 外链打开方式：0当前窗口 1新窗口 */
  openMode?: number;
}
export interface CmsNavigation {
  categories: CmsCategory[];
  tags: CmsTag[];
  topics: CmsOption[];
  pages: CmsOption[];
}
export interface CmsOption {
  id: string;
  title: string;
  slug: string;
  children?: CmsOption[];
  kind?: number;
  link?: string;
  target?: number;
  /** 专题内容类型：1内置内容 2外链 3文章 4自定义表单 5目录 6单页 */
  type?: number;
  /** 专题解析后的前台落地地址（外链/文章/表单/栏目/单页） */
  openMode?: number;
}
/** 栏目类型：1文章列表 2目录 3外链 4自定义表单 5单页 6下载列表，决定前台头部菜单的跳转行为 */
export const CMS_CATEGORY_TYPE = { list: 1, channel: 2, link: 3, form: 4, page: 5, download: 6 } as const;
export interface CmsCategory {
  id: string;
  title: string;
  slug: string;
  parentId?: string | null;
  children?: CmsCategory[];
  /** 类型：1文章列表 2目录 3外链 4自定义表单 5单页 6下载列表 */
  type?: number;
  /** 跳转链接，仅类型=3 时使用 */
  linkUrl?: string;
  /** 解析后的前台落地地址（后端按类型生成：1/2/6 栏目页、3 外链、4 表单页、5 单页） */
  link?: string;
  /** 外链打开方式：0当前窗口 1新窗口（仅类型=3） */
  openMode?: number;
  /** 是否显示在前台头部菜单 */
  isNav?: boolean;
  isRecommend?: boolean;
  coverUrl?: string;
}
export interface CmsTag {
  id: string;
  title: string;
  slug: string;
  isHot?: boolean;
}
export interface CmsQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  categoryId?: string;
  topicId?: string;
  tagId?: string;
  sortBy?: 'latest' | 'likes' | 'comments' | 'views';
}
export const articlesApi = () => request<{ list: CmsContent[]; total: number }, [CmsQuery]>((params) => ({ url: 'addons/cms/articles', method: 'get', params }), { noLoading: true, clearEmpty: ['', undefined] });
export const detailApi = () => request<CmsContent, ['article' | 'page' | 'topic', string]>((kind, slug) => ({ url: 'addons/cms/' + kind + '/' + encodeURIComponent(slug), method: 'get' }), { noLoading: true });
export const navigationApi = () => request<CmsNavigation, []>(() => ({ url: 'addons/cms/navigation', method: 'get' }), { noLoading: true });
export interface CmsBlockItem {
  id: string;
  kind: number;
  title: string;
  /** 前台标题：渲染到区块的 title 属性上，鼠标移入时以原生提示展示 */
  displayTitle: string;
  coverUrl: string;
  htmlContent: string;
  link: string;
}
/** 按「展示位置」取区块；位置在前台渲染点与后台字典中一一对应 */
export const blocksApi = () => request<CmsBlockItem[], [string]>((position) => ({ url: 'addons/cms/blocks/' + position, method: 'get' }), { noLoading: true });
export interface CmsComment {
  id: string;
  userId?: string;
  author: string;
  authorAvatar?: string;
  content: string;
  parentId?: string | null;
  createdAt: string;
  left?: number;
  right?: number;
  reportCount?: number;
}
export const reportCommentApi = () => request<{ reported: boolean }, [string, string, { reason: string }]>((slug, id, data) => ({ url: 'addons/cms/comments/' + encodeURIComponent(slug) + '/report/' + encodeURIComponent(id), method: 'post', data }), { success: true });
export const createCommentApi = () => request<CmsComment, [string, { content: string; parentId?: string | null }]>((slug, data) => ({ url: 'addons/cms/comments/' + encodeURIComponent(slug), method: 'post', data }), { success: true });
export interface CmsOrder {
  orderNo: string;
  articleId: string;
  itemName: string;
  contactName: string;
  contactPhone: string;
  shippingAddress: string;
  quantity: number;
  amount: string;
  status: number;
  paymentStatus: number;
  shippingStatus?: number;
  expressCompany?: string;
  expressNo?: string;
  shippedAt?: string | null;
  paidAt?: string | null;
  completedAt?: string | null;
  remark: string;
  accountLinked: boolean;
  createdAt: string;
  updatedAt: string;
}
export const commentsApi = () => request<{ list: CmsComment[]; total: number; page: number; pageSize: number }, [string, number]>((slug, page) => ({ url: 'addons/cms/comments/' + encodeURIComponent(slug), method: 'get', params: { page, pageSize: 3 } }), { noLoading: true });
export const createOrderApi = () => request<CmsOrder, [string, { contactName: string; contactPhone: string; shippingAddress: string; quantity: number; remark?: string }]>((slug, data) => ({ url: 'addons/cms/orders/' + encodeURIComponent(slug), method: 'post', data }), { noLoading: true });
export const queryOrderApi = () => request<CmsOrder, [{ orderNo: string; contactPhone: string }]>((params) => ({ url: 'addons/cms/orders/query', method: 'get', params }), { noLoading: true });
export const myOrdersApi = () => request<{ list: CmsOrder[]; total: number; page: number; pageSize: number }, [{ page?: number; pageSize?: number }]>((params) => ({ url: 'addons/cms/orders/mine', method: 'get', params }), { noLoading: true });
export const articleDownloadApi = () => request<{ url: string; title: string; downloads: number }, [string]>((slug) => ({ url: 'addons/cms/article/' + encodeURIComponent(slug) + '/download', method: 'post' }), { noLoading: true });
export interface CmsHome {
  hotTags: CmsTag[];
  recommendCategories: CmsCategory[];
  ranking: CmsContent[];
  rankingRule: { sortBy: string; limit: number };
}
export const homeApi = () => request<CmsHome, []>(() => ({ url: 'addons/cms/home', method: 'get' }), { noLoading: true });
export const relatedApi = () => request<CmsContent[], [string]>((slug) => ({ url: 'addons/cms/article/' + encodeURIComponent(slug) + '/related', method: 'get' }), { noLoading: true });
// ---- 自定义表单（前台留言板由后台「自定义表单」驱动） ----
/** 字段前台展示角色 */
export type CmsDiyformDisplayRole = 'title' | 'body' | 'meta' | 'normal' | 'hidden';
export interface CmsDiyformField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'date' | 'image';
  required?: boolean;
  placeholder?: string;
  maxlength?: number;
  options?: string[];
  contact?: boolean;
  /** 后台配置的前台展示角色；未配置时按字段类型推断 */
  displayRole?: CmsDiyformDisplayRole;
}
/** 表单前台展示配置 */
export interface CmsDiyformDisplayConfig {
  layout: string;
  showAvatar: boolean;
  showTime: boolean;
  pageSize: number;
  emptyText: string;
}
export const defaultDiyformDisplayConfig: CmsDiyformDisplayConfig = { layout: 'card', showAvatar: true, showTime: true, pageSize: 10, emptyText: '暂无公开数据' };
/** 安全解析展示配置：接口正常返回对象，兼容历史字符串与非法值 */
export const parseDisplayConfig = (raw: unknown): CmsDiyformDisplayConfig => {
  let parsed: Partial<CmsDiyformDisplayConfig> = {};
  if (typeof raw === 'string') {
    try {
      const value = JSON.parse(raw || '{}');
      if (value && typeof value === 'object' && !Array.isArray(value)) parsed = value as Partial<CmsDiyformDisplayConfig>;
    } catch {
      parsed = {};
    }
  } else if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    parsed = raw as Partial<CmsDiyformDisplayConfig>;
  }
  return {
    layout: typeof parsed.layout === 'string' && parsed.layout ? parsed.layout : defaultDiyformDisplayConfig.layout,
    showAvatar: typeof parsed.showAvatar === 'boolean' ? parsed.showAvatar : defaultDiyformDisplayConfig.showAvatar,
    showTime: typeof parsed.showTime === 'boolean' ? parsed.showTime : defaultDiyformDisplayConfig.showTime,
    pageSize: Number.isFinite(Number(parsed.pageSize)) && Number(parsed.pageSize) > 0 ? Math.min(Math.max(Number(parsed.pageSize), 1), 50) : defaultDiyformDisplayConfig.pageSize,
    emptyText: typeof parsed.emptyText === 'string' && parsed.emptyText ? parsed.emptyText : defaultDiyformDisplayConfig.emptyText,
  };
};
export interface CmsDiyform {
  id: string;
  title: string;
  diyname: string;
  description: string;
  submitText: string;
  needReview: number;
  fields: CmsDiyformField[];
  displayConfig?: CmsDiyformDisplayConfig;
}
export interface CmsDiyformRecord {
  id: string;
  author: string;
  content: string;
  reply: string;
  data: Record<string, unknown>;
  createdAt: string;
}
export interface CmsDiyformDetail {
  form: CmsDiyform | null;
  list: CmsDiyformRecord[];
  total: number;
  page: number;
  pageSize: number;
}
/** 按表单标识取表单及其公开数据：每个自定义表单都有独立的前台访问页 /aon/cms/form/{diyname} */
export const diyformApi = () => request<CmsDiyformDetail, [string, { page: number; pageSize?: number }]>((diyname, params) => ({ url: 'addons/cms/diyform/' + encodeURIComponent(diyname), method: 'get', params }), { noLoading: true });
export const submitDiyformApi = () => request<unknown, [string, Record<string, unknown>]>((diyname, data) => ({ url: 'addons/cms/diyform/' + encodeURIComponent(diyname), method: 'post', data }), { success: true });
