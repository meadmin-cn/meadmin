import request from '@/utils/request';
export interface CmsContent {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverUrl: string;
  mdContent?: string;
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
  isGallery?: boolean;
  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;
  /** 专题内容类型（仅 kind=topic 时有效）：1内置内容 2外链 3文章 4自定义表单 5目录 6单页 */
  type?: number;
  /** 专题解析后的前台落地地址（仅 kind=topic 且 type≠1 时非空） */
  link?: string;
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
/** 栏目类型：1文章列表 2目录 3跳转链接，决定前台头部菜单的跳转行为 */
export const CMS_CATEGORY_TYPE = { list: 1, channel: 2, link: 3, form: 4, page: 5 } as const;
export interface CmsCategory {
  id: string;
  title: string;
  slug: string;
  parentId?: string | null;
  children?: CmsCategory[];
  /** 类型：1文章列表 2目录 3外链 4自定义表单 5单页 */
  type?: number;
  /** 跳转链接，仅类型=3 时使用 */
  linkUrl?: string;
  /** 解析后的前台落地地址（后端按类型生成：1/2 栏目页、3 外链、4 表单页、5 单页） */
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
  mdContent: string;
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
export interface CmsDownload {
  id: string;
  title: string;
  slug: string;
  category: string;
  version: string;
  summary: string;
  mdContent: string;
  coverUrl: string;
  downloads: number;
}
export const downloadsApi = () => request<{ list: CmsDownload[]; total: number }, [{ page: number; pageSize: number; keyword?: string; category?: string }]>((params) => ({ url: 'addons/cms/download/', method: 'get', params }), { noLoading: true, clearEmpty: ['', undefined] });
export const downloadInfoApi = () => request<CmsDownload, [string]>((slug) => ({ url: 'addons/cms/download/info/' + encodeURIComponent(slug), method: 'get' }), { noLoading: true });
export const downloadApi = () => request<{ url: string; title: string; downloads: number }, [string]>((slug) => ({ url: 'addons/cms/download/download/' + encodeURIComponent(slug), method: 'post' }), { noLoading: true });
export const articleDownloadApi = () => request<{ url: string; title: string; downloads: number }, [string]>((slug) => ({ url: 'addons/cms/article/' + encodeURIComponent(slug) + '/download', method: 'post' }), { noLoading: true });
export interface CmsHome {
  hotTags: CmsTag[];
  recommendCategories: CmsCategory[];
  gallery: CmsContent[];
  ranking: CmsContent[];
  rankingRule: { sortBy: string; limit: number };
}
export const homeApi = () => request<CmsHome, []>(() => ({ url: 'addons/cms/home', method: 'get' }), { noLoading: true });
export const relatedApi = () => request<CmsContent[], [string]>((slug) => ({ url: 'addons/cms/article/' + encodeURIComponent(slug) + '/related', method: 'get' }), { noLoading: true });
export interface CmsMessage {
  author: string;
  content: string;
  reply: string;
  createdAt: string;
}
export const messagesApi = () => request<{ list: CmsMessage[]; total: number }, [{ page: number; pageSize: number }]>((params) => ({ url: 'addons/cms/message/', method: 'get', params }), { noLoading: true });
export const createMessageApi = () => request<unknown, [{ author: string; contact: string; content: string }]>((data) => ({ url: 'addons/cms/message/', method: 'post', data }), { success: true });

// ---- 自定义表单（前台留言板由后台「自定义表单」驱动） ----
export interface CmsDiyformField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'date' | 'image';
  required?: boolean;
  placeholder?: string;
  maxlength?: number;
  options?: string[];
  contact?: boolean;
}
export interface CmsDiyform {
  id: string;
  title: string;
  diyname: string;
  description: string;
  submitText: string;
  needReview: number;
  fields: CmsDiyformField[];
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
/** 取前台留言板表单及其公开数据（表单字段由后台配置决定） */
export const messageBoardApi = () => request<CmsDiyformDetail, [{ page: number; pageSize: number }]>((params) => ({ url: 'addons/cms/diyform/message', method: 'get', params }), { noLoading: true });
/** 按表单标识取表单及其公开数据：每个自定义表单都有独立的前台访问页 /aon/cms/form/{diyname} */
export const diyformApi = () => request<CmsDiyformDetail, [string, { page: number; pageSize: number }]>((diyname, params) => ({ url: 'addons/cms/diyform/' + encodeURIComponent(diyname), method: 'get', params }), { noLoading: true });
export const submitDiyformApi = () => request<unknown, [string, Record<string, unknown>]>((diyname, data) => ({ url: 'addons/cms/diyform/' + encodeURIComponent(diyname), method: 'post', data }), { success: true });
