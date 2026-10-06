import request from '@/utils/request.js';
export interface CmsTopic {
  title: string;
  slug: string;
  summary: string;
  mdContent: string;
  coverUrl: string;
  status: number;
  orderNum: number;
  /** 内容类型：1内置内容 2外链 3文章 4自定义表单 5目录 6单页 */
  type: number;
  /** 关联目标：外链地址或文章/表单/栏目/单页的 ID */
  target: string;
  /** 外链打开方式：0当前窗口 1新窗口 */
  targetBlank: number;
}
export type CmsTopicInfo = CmsTopic & { id: string; status: number; createdAt: string; children?: CmsTopicInfo[] };
export const defaults = (): CmsTopic => ({ title: '', slug: '', summary: '', mdContent: '', coverUrl: '', status: 1, orderNum: 0, type: 1, target: '', targetBlank: 0 });
export const listApi = () => request<{ list: CmsTopicInfo[]; total: number }, [{ page: number; pageSize: number; keyword?: string; status?: number }]>((data) => ({ url: 'addons/cms/topic/', method: 'post', data }), { noLoading: true, clearEmpty: ['', undefined] });
export const infoApi = () => request<CmsTopicInfo, [string]>((id) => ({ url: 'addons/cms/topic/info/' + id, method: 'get' }), { noLoading: true });
export const saveApi = () => request<CmsTopicInfo, [string | undefined, CmsTopic]>((id, data) => ({ url: 'addons/cms/topic/' + (id ? 'up/' + id : 'add'), method: 'post', data }), { success: true });
export const deleteApi = () => request<null, [string]>((id) => ({ url: 'addons/cms/topic/del/' + id, method: 'post' }), { success: true });
