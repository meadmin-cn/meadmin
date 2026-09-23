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
}
export type CmsArticleInfo = CmsArticle & { id: string; status: number; createdAt: string; children?: CmsArticleInfo[] };
export const defaults = (): CmsArticle => ({ title: '', slug: '', summary: '', mdContent: '', coverUrl: '', seoTitle: '', seoKeywords: '', seoDescription: '', publishAt: null, orderNum: 0, categoryId: null, topicId: null, tagIds: [], orderEnabled: false });
export const listApi = () => request<{ list: CmsArticleInfo[]; total: number }, [{ page: number; pageSize: number; keyword?: string; status?: number }]>((data) => ({ url: 'addons/cms/article/', method: 'post', data }), { noLoading: true, clearEmpty: ['', undefined] });
export const infoApi = () => request<CmsArticleInfo, [string]>((id) => ({ url: 'addons/cms/article/info/' + id, method: 'get' }), { noLoading: true });
export const saveApi = () => request<CmsArticleInfo, [string | undefined, CmsArticle]>((id, data) => ({ url: 'addons/cms/article/' + (id ? 'up/' + id : 'add'), method: 'post', data }), { success: true });
export const deleteApi = () => request<null, [string]>((id) => ({ url: 'addons/cms/article/del/' + id, method: 'post' }), { success: true });
export const actionApi = () => request<CmsArticleInfo, [string, 'review' | 'submit' | 'offline', boolean?]>((id, action, approve) => ({ url: 'addons/cms/article/' + action + '/' + id, method: 'post', data: action === 'review' ? { approve } : undefined }), { success: true });
