import request from '@/utils/request.js';
export interface CmsDownload {
  title: string;
  slug: string;
  category: string;
  version: string;
  summary: string;
  mdContent: string;
  coverUrl: string;
  fileUrl: string;
  status: number;
  orderNum: number;
}
export type CmsDownloadInfo = CmsDownload & { id: string; downloads: number; createdAt: string; updatedAt: string };
export const defaults = (): CmsDownload => ({ title: '', slug: '', category: '', version: '', summary: '', mdContent: '', coverUrl: '', fileUrl: '', status: 1, orderNum: 0 });
export const listApi = () => request<{ list: CmsDownloadInfo[]; total: number }, [{ page: number; pageSize: number; keyword?: string; status?: number }]>((data) => ({ url: 'addons/cms/download/', method: 'post', data }), { noLoading: true, clearEmpty: ['', undefined] });
export const infoApi = () => request<CmsDownloadInfo, [string]>((id) => ({ url: 'addons/cms/download/info/' + id, method: 'get' }), { noLoading: true });
export const saveApi = () => request<CmsDownloadInfo, [string | undefined, CmsDownload]>((id, data) => ({ url: 'addons/cms/download/' + (id ? 'up/' + id : 'add'), method: 'post', data }), { success: true });
export const deleteApi = () => request<null, [string]>((id) => ({ url: 'addons/cms/download/del/' + id, method: 'post' }), { success: true });
