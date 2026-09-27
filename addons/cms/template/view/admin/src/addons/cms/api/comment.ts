import request from '@/utils/request.js';
export interface CmsComment {
  articleId: string;
  author: string;
  content: string;
}
export type CmsCommentInfo = CmsComment & { id: string; status: number; reportCount: number; reportReason: string; reportedAt?: string | null; createdAt: string; children?: CmsCommentInfo[] };
export const defaults = (): CmsComment => ({ articleId: '', author: '', content: '' });
export const listApi = () => request<{ list: CmsCommentInfo[]; total: number }, [{ page: number; pageSize: number; keyword?: string; status?: number }]>((data) => ({ url: 'addons/cms/comment/', method: 'post', data }), { noLoading: true, clearEmpty: ['', undefined] });
export const infoApi = () => request<CmsCommentInfo, [string]>((id) => ({ url: 'addons/cms/comment/info/' + id, method: 'get' }), { noLoading: true });
export interface CmsCommentReport {
  id: string;
  commentId: string;
  articleId: string;
  userId: string;
  reason: string;
  createdAt: string;
}
export const reportsApi = () => request<{ list: CmsCommentReport[]; total: number }, [{ page: number; pageSize: number; commentId?: string }]>((data) => ({ url: 'addons/cms/comment/reports', method: 'post', data }), { noLoading: true });
export const saveApi = () => request<CmsCommentInfo, [string | undefined, CmsComment]>((id, data) => ({ url: 'addons/cms/comment/' + (id ? 'up/' + id : 'add'), method: 'post', data }), { success: true });
export const deleteApi = () => request<null, [string]>((id) => ({ url: 'addons/cms/comment/del/' + id, method: 'post' }), { success: true });
export const actionApi = () => request<CmsCommentInfo, [string, 'review', boolean?]>((id, action, approve) => ({ url: 'addons/cms/comment/' + action + '/' + id, method: 'post', data: action === 'review' ? { approve } : undefined }), { success: true });
