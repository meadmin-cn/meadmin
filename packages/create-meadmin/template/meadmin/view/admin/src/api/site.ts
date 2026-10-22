import type { PageResult } from '@/api/api.model.js';
import { PageParam } from '@/api/api.model.js';
import type { RequestOptions } from '@/utils/request.js';
import request from '@/utils/request.js';

/** 站点：域名绑定 + 根路径映射 */
export class SystemSite {
  id = ''; //ID
  name = ''; //站点名称
  domains: string[] = []; //绑定域名
  basePath = ''; //根路径映射目标
  status: 1 | 0 = 1; //状态:1=启用;0=禁用
  orderNum = 0; //排序
  remark = ''; //备注
  createdAt = '';
  updatedAt = '';
}

export type SystemSiteInfo = SystemSite;

export class SystemSiteListParam extends PageParam {
  name?: string;
  status?: 1 | 0;
  keyword?: string;
}

/** URL 模式编译结果：nginx 写法解析出的 alias 与目标路由；ok=false 时 error 有值 */
export type SystemRewriteCompiled = {
  ok: boolean;
  modifier?: string;
  kind?: 'prefix' | 'exact' | 'regex';
  alias?: string;
  target?: string;
  error?: string;
};

/** 伪静态规则 */
export class SystemRewrite {
  id = ''; //ID
  siteId = ''; //站点ID
  pattern = ''; //URL 模式（nginx location 风格）
  target = ''; //目标前端路由
  status: 1 | 0 = 1; //状态
  orderNum = 0; //排序
  remark = ''; //备注
  createdAt = '';
  updatedAt = '';
  compiled?: SystemRewriteCompiled; //列表接口附带的编译结果
}

export type SystemRewriteInfo = SystemRewrite;

export class SystemRewriteListParam extends PageParam {
  siteId?: string;
  pattern?: string;
  target?: string;
  status?: 1 | 0;
  keyword?: string;
}

/** URL 模式编译预览参数 */
export class SystemRewriteCompileParam {
  pattern = '';
  target = '';
}

export type SystemSiteSaveParam = Pick<SystemSite, 'name' | 'domains' | 'basePath' | 'status' | 'orderNum' | 'remark'>;
export type SystemRewriteSaveParam = Pick<SystemRewrite, 'siteId' | 'pattern' | 'target' | 'status' | 'orderNum' | 'remark'>;

//获取站点列表
export function systemSiteListApi(options?: RequestOptions<PageResult<SystemSiteInfo>, [SystemSiteListParam]>) {
  return request<PageResult<SystemSiteInfo>, [SystemSiteListParam]>((data) => ({ url: 'system/site/', method: 'post', data }), Object.assign({ noLoading: true, clearEmpty: ['', undefined, null] }, options));
}

//获取全部站点（站点切换/下拉）
export function systemSiteAllApi(options?: RequestOptions<SystemSiteInfo[], []>) {
  return request<SystemSiteInfo[], []>(() => ({ url: 'system/site/all', method: 'get' }), Object.assign({ noLoading: true }, options));
}

//添加站点
export function addSystemSiteApi(options?: RequestOptions<SystemSiteInfo, [SystemSiteSaveParam]>) {
  return request<SystemSiteInfo, [SystemSiteSaveParam]>((data) => ({ url: 'system/site/add', method: 'post', data }), Object.assign({ success: true }, options));
}

//更新站点
export function updateSystemSiteApi(options?: RequestOptions<SystemSiteInfo, [string, Partial<SystemSiteSaveParam>]>) {
  return request<SystemSiteInfo, [string, Partial<SystemSiteSaveParam>]>((id, data) => ({ url: `system/site/up/${id}`, method: 'post', data }), Object.assign({ success: true, noLoading: true }, options));
}

//删除站点（级联删除规则）
export function delSystemSiteApi(options?: RequestOptions<null, [string]>) {
  return request<null, [string]>((id) => ({ url: `system/site/del/${id}`, method: 'post' }), Object.assign({ success: true, noLoading: true }, options));
}

// 兼容页面内直接 await 的调用方式：request 返回 useRequest 结果，取 runAsync。
export const createSite = (data: SystemSiteSaveParam) => addSystemSiteApi().runAsync(data);
export const saveSiteInfo = (id: string, data: Partial<SystemSiteSaveParam>) => updateSystemSiteApi().runAsync(id, data);
export const removeSiteInfo = (id: string) => delSystemSiteApi().runAsync(id);

//获取伪静态规则列表
export function systemRewriteListApi(options?: RequestOptions<PageResult<SystemRewriteInfo>, [SystemRewriteListParam]>) {
  return request<PageResult<SystemRewriteInfo>, [SystemRewriteListParam]>((data) => ({ url: 'system/rewrite/', method: 'post', data }), Object.assign({ noLoading: true, clearEmpty: ['', undefined, null] }, options));
}

//添加伪静态规则
export function addSystemRewriteApi(options?: RequestOptions<SystemRewriteInfo, [SystemRewriteSaveParam]>) {
  return request<SystemRewriteInfo, [SystemRewriteSaveParam]>((data) => ({ url: 'system/rewrite/add', method: 'post', data }), Object.assign({ success: true }, options));
}

//更新伪静态规则
export function updateSystemRewriteApi(options?: RequestOptions<SystemRewriteInfo, [string, Partial<SystemRewriteSaveParam>]>) {
  return request<SystemRewriteInfo, [string, Partial<SystemRewriteSaveParam>]>((id, data) => ({ url: `system/rewrite/up/${id}`, method: 'post', data }), Object.assign({ success: true, noLoading: true }, options));
}

//删除伪静态规则
export function delSystemRewriteApi(options?: RequestOptions<null, [string]>) {
  return request<null, [string]>((id) => ({ url: `system/rewrite/del/${id}`, method: 'post' }), Object.assign({ success: true, noLoading: true }, options));
}

export const createRewrite = (data: SystemRewriteSaveParam) => addSystemRewriteApi().runAsync(data);
export const saveRewriteInfo = (id: string, data: Partial<SystemRewriteSaveParam>) => updateSystemRewriteApi().runAsync(id, data);
export const removeRewriteInfo = (id: string) => delSystemRewriteApi().runAsync(id);

//编译预览 URL 模式（nginx 语法）
export function compileRewriteApi(options?: RequestOptions<SystemRewriteCompiled, [SystemRewriteCompileParam]>) {
  return request<SystemRewriteCompiled, [SystemRewriteCompileParam]>((data) => ({ url: 'system/rewrite/compile', method: 'post', data }), Object.assign({ success: false, noLoading: true }, options));
}

export const previewRewrite = (data: SystemRewriteCompileParam) => compileRewriteApi().runAsync(data);
