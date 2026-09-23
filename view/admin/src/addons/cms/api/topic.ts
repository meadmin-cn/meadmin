import request from '@/utils/request.js';
export interface CmsTopic {
  title: string;
  slug: string;
  summary: string;
  mdContent: string;
  coverUrl: string;
  status: number;
  orderNum: number;
}
export type CmsTopicInfo = CmsTopic & { id: string; status: number; createdAt: string; children?: CmsTopicInfo[] };
export const defaults = (): CmsTopic => ({ title: '', slug: '', summary: '', mdContent: '', coverUrl: '', status: 1, orderNum: 0 });
export const listApi = () => request<{ list: CmsTopicInfo[]; total: number }, [{ page: number; pageSize: number; keyword?: string; status?: number }]>((data) => ({ url: 'addons/cms/topic/', method: 'post', data }), { noLoading: true, clearEmpty: ['', undefined] });
export const infoApi = () => request<CmsTopicInfo, [string]>((id) => ({ url: 'addons/cms/topic/info/' + id, method: 'get' }), { noLoading: true });
export const saveApi = () => request<CmsTopicInfo, [string | undefined, CmsTopic]>((id, data) => ({ url: 'addons/cms/topic/' + (id ? 'up/' + id : 'add'), method: 'post', data }), { success: true });
export const deleteApi = () => request<null, [string]>((id) => ({ url: 'addons/cms/topic/del/' + id, method: 'post' }), { success: true });
