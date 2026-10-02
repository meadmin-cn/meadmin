import request from '@/utils/request.js';

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
}
export type CmsDiyformInfo = CmsDiyform & { id: string; createdAt: string; dataCount?: number };
export const defaults = (): CmsDiyform => ({ title: '', diyname: '', description: '', fields: '[]', submitText: '提交', needReview: 1, isMessageBoard: false, status: 1, orderNum: 0 });

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

export const listApi = () => request<{ list: CmsDiyformInfo[]; total: number }, [{ page: number; pageSize: number; keyword?: string; status?: number }]>((data) => ({ url: 'addons/cms/diyform/', method: 'post', data }), { noLoading: true, clearEmpty: ['', undefined] });
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
