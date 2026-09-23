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
  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;
}
export interface CmsNavigation {
  categories: CmsOption[];
  tags: CmsOption[];
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
export const navigationApi = () => request<{ categories: CmsOption[]; tags: CmsOption[]; topics: CmsOption[]; pages: CmsOption[] }, []>(() => ({ url: 'addons/cms/navigation', method: 'get' }), { noLoading: true });
export const blocksApi = () => request<Array<{ id: string; kind: number; title: string; coverUrl: string; mdContent: string; link: string; summary?: string }>, []>(() => ({ url: 'addons/cms/blocks/home', method: 'get' }), { noLoading: true });
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
  remark: string;
  accountLinked: boolean;
  createdAt: string;
  updatedAt: string;
}
export const commentsApi = () => request<{ list: CmsComment[]; total: number }, [string, number]>((slug, page) => ({ url: 'addons/cms/comments/' + encodeURIComponent(slug), method: 'get', params: { page, pageSize: 20 } }), { noLoading: true });
export const createOrderApi = () => request<CmsOrder, [string, { contactName: string; contactPhone: string; shippingAddress: string; quantity: number; remark?: string }]>((slug, data) => ({ url: 'addons/cms/orders/' + encodeURIComponent(slug), method: 'post', data }), { noLoading: true });
export const queryOrderApi = () => request<CmsOrder, [{ orderNo: string; contactPhone: string }]>((params) => ({ url: 'addons/cms/orders/query', method: 'get', params }), { noLoading: true });
export interface CmsDownload { id: string; title: string; slug: string; category: string; version: string; summary: string; mdContent: string; coverUrl: string; fileUrl: string; downloads: number }
export const downloadsApi = () => request<{ list: CmsDownload[]; total: number }, [{ page: number; pageSize: number; keyword?: string; category?: string }]>((params) => ({ url: 'addons/cms/download/', method: 'get', params }), { noLoading: true, clearEmpty: ['', undefined] });
export const downloadApi = () => request<{ url: string; title: string }, [string]>((slug) => ({ url: 'addons/cms/download/download/' + encodeURIComponent(slug), method: 'post' }), { noLoading: true });
export interface CmsMessage { author: string; content: string; reply: string; createdAt: string }
export const messagesApi = () => request<{ list: CmsMessage[]; total: number }, [{ page: number; pageSize: number }]>((params) => ({ url: 'addons/cms/message/', method: 'get', params }), { noLoading: true });
export const createMessageApi = () => request<unknown, [{ author: string; contact: string; content: string }]>((data) => ({ url: 'addons/cms/message/', method: 'post', data }), { success: true });
