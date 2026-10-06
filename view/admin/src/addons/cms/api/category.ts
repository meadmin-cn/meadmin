import request from '@/utils/request.js';
export interface CmsCategory {
  title: string;
  slug: string;
  status: number;
  orderNum: number;
  parentId: string | null;
  /** 类型：1文章列表 2目录 3外链 4自定义表单 5单页 */
  type: number;
  /** 跳转链接，仅类型=3 时使用 */
  linkUrl: string;
  /** 跳转目标：类型=4 存表单 id，类型=5 存单页 id */
  target: string;
  /** 是否在前台头部导航显示 */
  isNav: boolean;
  isRecommend: boolean;
  coverUrl: string;
}
export type CmsCategoryInfo = CmsCategory & { id: string; status: number; createdAt: string; children?: CmsCategoryInfo[] };
export const defaults = (): CmsCategory => ({ title: '', slug: '', status: 1, orderNum: 0, parentId: null, type: 1, linkUrl: '', target: '', isNav: true, isRecommend: false, coverUrl: '' });

/** 栏目类型：决定前台头部菜单的跳转行为，与后端 AonCmsCategory.type 一一对应 */
export interface CmsCategoryType {
  value: number;
  label: string;
  desc: string;
}
export const cmsCategoryTypes: CmsCategoryType[] = [
  { value: 1, label: '文章列表', desc: '点击进入该栏目的文章列表页，可在此栏目下发布文章。' },
  { value: 2, label: '目录', desc: '仅作为菜单分组使用，本身不发布文章；前台点击后展示该目录下全部内容。' },
  { value: 3, label: '外链', desc: '点击后在新窗口打开「跳转链接」填写的地址，可填站内路径或完整网址。' },
  { value: 4, label: '自定义表单', desc: '点击进入「选择表单」指定的自定义表单提交页（如留言板）。' },
  { value: 5, label: '单页', desc: '点击进入「选择单页」指定的单页内容（如关于我们）。' },
];
export const cmsCategoryTypeLabel = (type?: number): string => cmsCategoryTypes.find((item) => item.value === (type ?? 1))?.label ?? '文章列表';
export const listApi = () => request<{ list: CmsCategoryInfo[]; total: number }, [{ page: number; pageSize: number; keyword?: string; status?: number }]>((data) => ({ url: 'addons/cms/category/', method: 'post', data }), { noLoading: true, clearEmpty: ['', undefined] });
export const infoApi = () => request<CmsCategoryInfo, [string]>((id) => ({ url: 'addons/cms/category/info/' + id, method: 'get' }), { noLoading: true });
export const saveApi = () => request<CmsCategoryInfo, [string | undefined, CmsCategory]>((id, data) => ({ url: 'addons/cms/category/' + (id ? 'up/' + id : 'add'), method: 'post', data }), { success: true });
export const deleteApi = () => request<null, [string]>((id) => ({ url: 'addons/cms/category/del/' + id, method: 'post' }), { success: true });

export const treeApi = () => request<CmsCategoryInfo[], []>(() => ({ url: 'addons/cms/category/tree', method: 'get' }), { noLoading: true });
