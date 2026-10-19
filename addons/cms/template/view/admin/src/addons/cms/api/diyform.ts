import request from '@/utils/request.js';

/** 前台展示角色：决定该字段在公开数据卡片中的位置 */
export type CmsDiyformDisplayRole = 'title' | 'body' | 'meta' | 'normal' | 'hidden';

/** 表单字段定义：前台按此渲染，后台据此生成导出表头 */
export interface CmsDiyformField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'date' | 'image';
  required?: boolean;
  placeholder?: string;
  maxlength?: number;
  options?: string[];
  /** 该字段作为「联系方式」抽取，仅后台可见 */
  contact?: boolean;
  /** 前台展示角色 */
  displayRole?: CmsDiyformDisplayRole;
}

export interface CmsDiyform {
  title: string;
  diyname: string;
  description: string;
  fields: string;
  submitText: string;
  needReview: number;
  isMessageBoard: boolean;
  status: number;
  orderNum: number;
  /** 关联栏目：仅「4 自定义表单」型栏目可选，与文章.categoryId 同一套逻辑 */
  categoryId: string | null;
  /** 前台展示配置（JSON 字符串） */
  displayConfig: string;
}
export type CmsDiyformInfo = CmsDiyform & { id: string; createdAt: string; dataCount?: number; categoryTitle?: string };
export const defaults = (): CmsDiyform => ({ title: '', diyname: '', description: '', fields: '[]', submitText: '提交', needReview: 1, isMessageBoard: false, status: 1, orderNum: 0, categoryId: null, displayConfig: '{}' });

/** 前台展示角色可选值（与前台渲染位置一一对应） */
export const cmsDiyformDisplayRoles: Array<{ value: CmsDiyformDisplayRole; label: string }> = [
  { value: 'title', label: '标题/用户名' },
  { value: 'body', label: '正文' },
  { value: 'meta', label: '辅助信息' },
  { value: 'normal', label: '普通信息' },
  { value: 'hidden', label: '仅后台可见' },
];

/** 前台展示配置 */
export interface CmsDiyformDisplayConfig {
  layout: string;
  showAvatar: boolean;
  showTime: boolean;
  pageSize: number;
  emptyText: string;
}
export const defaultDisplayConfig: CmsDiyformDisplayConfig = { layout: 'card', showAvatar: true, showTime: true, pageSize: 10, emptyText: '暂无公开数据' };

/** 安全解析前台展示配置，非法 JSON 或字段缺失时回退默认值 */
export const parseDisplayConfig = (raw: string | CmsDiyformDisplayConfig | null | undefined): CmsDiyformDisplayConfig => {
  if (raw && typeof raw === 'object') return { ...defaultDisplayConfig, ...raw };
  let parsed: Partial<CmsDiyformDisplayConfig> = {};
  try {
    const value = JSON.parse(raw || '{}');
    if (value && typeof value === 'object' && !Array.isArray(value)) parsed = value as Partial<CmsDiyformDisplayConfig>;
  } catch {
    parsed = {};
  }
  return {
    layout: typeof parsed.layout === 'string' && parsed.layout ? parsed.layout : defaultDisplayConfig.layout,
    showAvatar: typeof parsed.showAvatar === 'boolean' ? parsed.showAvatar : defaultDisplayConfig.showAvatar,
    showTime: typeof parsed.showTime === 'boolean' ? parsed.showTime : defaultDisplayConfig.showTime,
    pageSize: Number.isFinite(Number(parsed.pageSize)) && Number(parsed.pageSize) > 0 ? Math.min(Math.max(Number(parsed.pageSize), 1), 50) : defaultDisplayConfig.pageSize,
    emptyText: typeof parsed.emptyText === 'string' && parsed.emptyText ? parsed.emptyText : defaultDisplayConfig.emptyText,
  };
};

/** 可用字段类型（与前台渲染器一一对应） */
export const cmsDiyformFieldTypes: Array<{ value: CmsDiyformField['type']; label: string }> = [
  { value: 'text', label: '单行文本' },
  { value: 'textarea', label: '多行文本' },
  { value: 'number', label: '数字' },
  { value: 'select', label: '下拉选择' },
  { value: 'radio', label: '单选' },
  { value: 'checkbox', label: '多选' },
  { value: 'date', label: '日期' },
  { value: 'image', label: '图片上传' },
];

export const listApi = () => request<{ list: CmsDiyformInfo[]; total: number }, [{ page: number; pageSize: number; keyword?: string; status?: number; categoryId?: string }]>((data) => ({ url: 'addons/cms/diyform/', method: 'post', data }), { noLoading: true, clearEmpty: ['', undefined] });
export const infoApi = () => request<CmsDiyformInfo, [string]>((id) => ({ url: 'addons/cms/diyform/info/' + id, method: 'get' }), { noLoading: true });
export const saveApi = () => request<CmsDiyformInfo, [string | undefined, CmsDiyform]>((id, data) => ({ url: 'addons/cms/diyform/' + (id ? 'up/' + id : 'add'), method: 'post', data }), { success: true });
export const deleteApi = () => request<null, [string]>((id) => ({ url: 'addons/cms/diyform/del/' + id, method: 'post' }), { success: true });

// ---- 提交数据 ----
export interface CmsDiyformData {
  id: string;
  formId: string;
  diyname: string;
  data: string;
  author: string;
  contact: string;
  reply: string;
  source: string;
  status: number;
  createdAt: string;
}
export interface CmsDiyformDataQuery {
  page: number;
  pageSize: number;
  formId?: string;
  diyname?: string;
  keyword?: string;
  status?: number | null;
}
export const dataListApi = () => request<{ list: CmsDiyformData[]; total: number; page: number; pageSize: number }, [CmsDiyformDataQuery]>((data) => ({ url: 'addons/cms/diyform/data', method: 'post', data }), { noLoading: true, clearEmpty: ['', undefined, null] });
export const dataInfoApi = () => request<CmsDiyformData, [string]>((id) => ({ url: 'addons/cms/diyform/data/info/' + id, method: 'get' }), { noLoading: true });
export const dataUpdateApi = () => request<CmsDiyformData, [string, { status?: number; reply?: string }]>((id, data) => ({ url: 'addons/cms/diyform/data/up/' + id, method: 'post', data }), { success: true });
export const dataDeleteApi = () => request<null, [string]>((id) => ({ url: 'addons/cms/diyform/data/del/' + id, method: 'post' }), { success: true });
export const dataExportApi = () => request<{ filename: string; content: string; total: number }, [CmsDiyformDataQuery]>((data) => ({ url: 'addons/cms/diyform/data/export', method: 'post', data }), { noLoading: true });

/** 解析表单字段配置，异常时返回空数组 */
export const parseFields = (raw: string): CmsDiyformField[] => {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? (parsed as CmsDiyformField[]) : [];
  } catch {
    return [];
  }
};
/** 解析一条提交数据 */
export const parseData = (raw: string): Record<string, unknown> => {
  try {
    const parsed = JSON.parse(raw || '{}');
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
};
/** 数据状态文案 */
export const cmsDiyformDataStates = ['待审核', '已通过', '已拒绝'];
