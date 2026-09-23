import request from '@/utils/request.js';
export interface CmsCategory {
  title: string;
  slug: string;
  status: number;
  orderNum: number;
  parentId: string | null;
}
export type CmsCategoryInfo = CmsCategory & { id: string; status: number; createdAt: string; children?: CmsCategoryInfo[] };
export const defaults = (): CmsCategory => ({ title: '', slug: '', status: 1, orderNum: 0, parentId: null });
export const listApi = () => request<{ list: CmsCategoryInfo[]; total: number }, [{ page: number; pageSize: number; keyword?: string; status?: number }]>((data) => ({ url: 'addons/cms/category/', method: 'post', data }), { noLoading: true, clearEmpty: ['', undefined] });
export const infoApi = () => request<CmsCategoryInfo, [string]>((id) => ({ url: 'addons/cms/category/info/' + id, method: 'get' }), { noLoading: true });
export const saveApi = () => request<CmsCategoryInfo, [string | undefined, CmsCategory]>((id, data) => ({ url: 'addons/cms/category/' + (id ? 'up/' + id : 'add'), method: 'post', data }), { success: true });
export const deleteApi = () => request<null, [string]>((id) => ({ url: 'addons/cms/category/del/' + id, method: 'post' }), { success: true });

export const treeApi = () => request<CmsCategoryInfo[], []>(() => ({ url: 'addons/cms/category/tree', method: 'get' }), { noLoading: true });
