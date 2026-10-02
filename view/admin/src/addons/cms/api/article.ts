import request from '@/utils/request.js';
export interface CmsArticle {
  title: string;
  slug: string;
  summary: string;
  mdContent: string;
  coverUrl: string;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  publishAt: string | null;
  orderNum: number;
  categoryId: string | null;
  topicId: string | null;
  tagIds: string[];
  orderEnabled: boolean;
  isDownload: boolean;
  fileUrl: string;
  fileName: string;
  isGallery: boolean;
}
// 详情接口返回时已补齐关联标题（categoryTitle/topicTitle/tagTitles）与下单数（orderCount）
export type CmsArticleInfo = CmsArticle & { id: string; status: number; createdAt: string; updatedAt?: string; views: number; likes: number; comments: number; downloads: number; orderCount: number; categoryTitle?: string; topicTitle?: string; tagTitles?: string[]; children?: CmsArticleInfo[] };
// 审核快照：兼容历史纯正文快照与新版完整内容 JSON
export type CmsArticleSnapshot = Partial<CmsArticle> & { mdContent?: string };
export const parseSnapshot = (snapshot?: string | null): CmsArticleSnapshot | null => {
  if (!snapshot) return null;
  const text = String(snapshot).trim();
  if (!text) return null;
  if (text.startsWith('{')) {
    try {
      return JSON.parse(text) as CmsArticleSnapshot;
    } catch {
      return { mdContent: text };
    }
  }
  return { mdContent: text };
};
export const defaults = (): CmsArticle => ({ title: '', slug: '', summary: '', mdContent: '', coverUrl: '', seoTitle: '', seoKeywords: '', seoDescription: '', publishAt: null, orderNum: 0, categoryId: null, topicId: null, tagIds: [], orderEnabled: false, isDownload: false, fileUrl: '', fileName: '', isGallery: false });
export const listApi = () => request<{ list: CmsArticleInfo[]; total: number }, [{ page: number; pageSize: number; keyword?: string; status?: number; categoryId?: string; isDownload?: boolean; type?: 'download' | 'order' | 'normal'; orderBy?: string; orderDirection?: 'asc' | 'desc' }]>((data) => ({ url: 'addons/cms/article/', method: 'post', data }), { noLoading: true, clearEmpty: ['', undefined] });
export const infoApi = () => request<CmsArticleInfo, [string]>((id) => ({ url: 'addons/cms/article/info/' + id, method: 'get' }), { noLoading: true });
export const saveApi = () => request<CmsArticleInfo, [string | undefined, CmsArticle]>((id, data) => ({ url: 'addons/cms/article/' + (id ? 'up/' + id : 'add'), method: 'post', data }), { success: true });
export const deleteApi = () => request<null, [string]>((id) => ({ url: 'addons/cms/article/del/' + id, method: 'post' }), { success: true });
export interface CmsReviewLog {
  id: string;
  contentId: string;
  contentType: string;
  fromStatus: number;
  toStatus: number;
  action: string;
  reason: string;
  snapshot: string | null;
  createdAdminId?: string;
  createdAdminName?: string;
  createdAt: string;
}
export const actionApi = () => request<CmsArticleInfo, [string, 'review' | 'submit' | 'offline', boolean?, string?]>((id, action, approve, reason = '') => ({ url: 'addons/cms/article/' + action + '/' + id, method: 'post', data: action === 'review' ? { approve, reason } : undefined }), { success: true });
export const reviewHistoryApi = () => request<CmsReviewLog[], [string]>((id) => ({ url: 'addons/cms/article/review-history/' + id, method: 'get' }), { noLoading: true });
