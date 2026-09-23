import request from '@/utils/request.js';
export interface CmsPage {
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
}
export type CmsPageInfo = CmsPage & { id: string; status: number; createdAt: string; children?: CmsPageInfo[] };
export const defaults = (): CmsPage => ({ title: '', slug: '', summary: '', mdContent: '', coverUrl: '', seoTitle: '', seoKeywords: '', seoDescription: '', publishAt: null, orderNum: 0 });
export const listApi = () => request<{ list: CmsPageInfo[]; total: number }, [{ page: number; pageSize: number; keyword?: string; status?: number }]>((data) => ({ url: 'addons/cms/page/', method: 'post', data }), { noLoading: true, clearEmpty: ['', undefined] });
export const infoApi = () => request<CmsPageInfo, [string]>((id) => ({ url: 'addons/cms/page/info/' + id, method: 'get' }), { noLoading: true });
export const saveApi = () => request<CmsPageInfo, [string | undefined, CmsPage]>((id, data) => ({ url: 'addons/cms/page/' + (id ? 'up/' + id : 'add'), method: 'post', data }), { success: true });
export const deleteApi = () => request<null, [string]>((id) => ({ url: 'addons/cms/page/del/' + id, method: 'post' }), { success: true });
export const actionApi = () => request<CmsPageInfo, [string, 'review' | 'submit' | 'offline', boolean?]>((id, action, approve) => ({ url: 'addons/cms/page/' + action + '/' + id, method: 'post', data: action === 'review' ? { approve } : undefined }), { success: true });
