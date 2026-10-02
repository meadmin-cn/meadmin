import request from '@/utils/request.js';
export interface CmsBlock {
  title: string;
  /** 前台标题：前台渲染时以 title 属性展示（鼠标移入可见），留空则不展示 */
  displayTitle: string;
  slug: string;
  position: string;
  mdContent: string;
  coverUrl: string;
  link: string;
  status: number;
  startAt: string | null;
  endAt: string | null;
  orderNum: number;
  config: string;
}
export type CmsBlockInfo = CmsBlock & { id: string; kind: number; createdAt: string; children?: CmsBlockInfo[] };
/** 展示位置定义：位置决定前台渲染点与各字段的用途 */
export interface CmsBlockPosition {
  value: string;
  label: string;
  render: 'carousel' | 'content' | 'image-link' | 'config';
  renderLabel: string;
  desc: string;
  limit: number;
  usage: Array<{ field: 'coverUrl' | 'mdContent' | 'link' | 'config'; label: string; hint: string }>;
  kind: number;
  imageHint: string;
  imageRequired: boolean;
  configSample?: string;
}
export const defaults = (): CmsBlock => ({ title: '', displayTitle: '', slug: '', position: 'home-content', mdContent: '', coverUrl: '', link: '', status: 1, startAt: null, endAt: null, orderNum: 0, config: '' });
export const listApi = () => request<{ list: CmsBlockInfo[]; total: number }, [{ page: number; pageSize: number; keyword?: string; status?: number; position?: string }]>((data) => ({ url: 'addons/cms/block/', method: 'post', data }), { noLoading: true, clearEmpty: ['', undefined] });
export const infoApi = () => request<CmsBlockInfo, [string]>((id) => ({ url: 'addons/cms/block/info/' + id, method: 'get' }), { noLoading: true });
export const saveApi = () => request<CmsBlockInfo, [string | undefined, CmsBlock]>((id, data) => ({ url: 'addons/cms/block/' + (id ? 'up/' + id : 'add'), method: 'post', data }), { success: true });
export const deleteApi = () => request<null, [string]>((id) => ({ url: 'addons/cms/block/del/' + id, method: 'post' }), { success: true });
export const positionsApi = () => request<CmsBlockPosition[], []>(() => ({ url: 'addons/cms/block/positions', method: 'get' }), { noLoading: true });
