import request from '@/utils/request.js';
export interface CmsBlock {
  title: string;
  slug: string;
  position: string;
  kind: number;
  mdContent: string;
  coverUrl: string;
  link: string;
  status: number;
  startAt: string | null;
  endAt: string | null;
  orderNum: number;
}
export type CmsBlockInfo = CmsBlock & { id: string; status: number; createdAt: string; children?: CmsBlockInfo[] };
export const defaults = (): CmsBlock => ({ title: '', slug: '', position: 'home', kind: 1, mdContent: '', coverUrl: '', link: '', status: 1, startAt: null, endAt: null, orderNum: 0 });
export const listApi = () => request<{ list: CmsBlockInfo[]; total: number }, [{ page: number; pageSize: number; keyword?: string; status?: number }]>((data) => ({ url: 'addons/cms/block/', method: 'post', data }), { noLoading: true, clearEmpty: ['', undefined] });
export const infoApi = () => request<CmsBlockInfo, [string]>((id) => ({ url: 'addons/cms/block/info/' + id, method: 'get' }), { noLoading: true });
export const saveApi = () => request<CmsBlockInfo, [string | undefined, CmsBlock]>((id, data) => ({ url: 'addons/cms/block/' + (id ? 'up/' + id : 'add'), method: 'post', data }), { success: true });
export const deleteApi = () => request<null, [string]>((id) => ({ url: 'addons/cms/block/del/' + id, method: 'post' }), { success: true });
