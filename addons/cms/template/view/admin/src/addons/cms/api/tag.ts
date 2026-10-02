import request from '@/utils/request.js';
export interface CmsTag {
  title: string;
  slug: string;
  status: number;
  orderNum: number;
  isHot: boolean;
}
export type CmsTagInfo = CmsTag & { id: string; status: number; createdAt: string; children?: CmsTagInfo[] };
export const defaults = (): CmsTag => ({ title: '', slug: '', status: 1, orderNum: 0, isHot: false });
export const listApi = () => request<{ list: CmsTagInfo[]; total: number }, [{ page: number; pageSize: number; keyword?: string; status?: number }]>((data) => ({ url: 'addons/cms/tag/', method: 'post', data }), { noLoading: true, clearEmpty: ['', undefined] });
export const infoApi = () => request<CmsTagInfo, [string]>((id) => ({ url: 'addons/cms/tag/info/' + id, method: 'get' }), { noLoading: true });
export const saveApi = () => request<CmsTagInfo, [string | undefined, CmsTag]>((id, data) => ({ url: 'addons/cms/tag/' + (id ? 'up/' + id : 'add'), method: 'post', data }), { success: true });
export const deleteApi = () => request<null, [string]>((id) => ({ url: 'addons/cms/tag/del/' + id, method: 'post' }), { success: true });
