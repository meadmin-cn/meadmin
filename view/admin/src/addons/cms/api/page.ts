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
export type CmsPageInfo = CmsPage & { id: string; status: number; createdAt: string; updatedAt?: string; kind?: number; link?: string; target?: string; children?: CmsPageInfo[] };
// 审核快照：兼容历史纯正文快照与新版完整内容 JSON
export type CmsPageSnapshot = Partial<CmsPage> & { kind?: number; link?: string; target?: string; mdContent?: string };
export const parseSnapshot = (snapshot?: string | null): CmsPageSnapshot | null => {
  if (!snapshot) return null;
  const text = String(snapshot).trim();
  if (!text) return null;
  if (text.startsWith('{')) {
    try {
      return JSON.parse(text) as CmsPageSnapshot;
    } catch {
      return { mdContent: text };
    }
  }
  return { mdContent: text };
};
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
export const defaults = (): CmsPage => ({ title: '', slug: '', summary: '', mdContent: '', coverUrl: '', seoTitle: '', seoKeywords: '', seoDescription: '', publishAt: null, orderNum: 0 });
export const listApi = () => request<{ list: CmsPageInfo[]; total: number }, [{ page: number; pageSize: number; keyword?: string; status?: number }]>((data) => ({ url: 'addons/cms/page/', method: 'post', data }), { noLoading: true, clearEmpty: ['', undefined] });
export const infoApi = () => request<CmsPageInfo, [string]>((id) => ({ url: 'addons/cms/page/info/' + id, method: 'get' }), { noLoading: true });
export const saveApi = () => request<CmsPageInfo, [string | undefined, CmsPage]>((id, data) => ({ url: 'addons/cms/page/' + (id ? 'up/' + id : 'add'), method: 'post', data }), { success: true });
export const deleteApi = () => request<null, [string]>((id) => ({ url: 'addons/cms/page/del/' + id, method: 'post' }), { success: true });
// 拒绝审核时后端要求填写原因，这里与文章接口保持一致带上 reason
export const actionApi = () => request<CmsPageInfo, [string, 'review' | 'submit' | 'offline', boolean?, string?]>((id, action, approve, reason = '') => ({ url: 'addons/cms/page/' + action + '/' + id, method: 'post', data: action === 'review' ? { approve, reason } : undefined }), { success: true });
export const reviewHistoryApi = () => request<CmsReviewLog[], [string]>((id) => ({ url: 'addons/cms/page/review-history/' + id, method: 'get' }), { noLoading: true });
