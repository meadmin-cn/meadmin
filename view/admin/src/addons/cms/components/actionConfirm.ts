// CMS 各列表页破坏性/状态变更操作统一走二次确认弹窗，这里定义弹窗描述项的公共类型
export interface CmsConfirmItem {
  label: string;
  value?: string | number | null;
  /** 以标签形式展示（状态等） */
  tag?: boolean;
  tagType?: 'primary' | 'success' | 'info' | 'warning' | 'danger';
}
export type CmsConfirmAlertType = 'success' | 'warning' | 'info' | 'error';
export type CmsConfirmButtonType = 'primary' | 'success' | 'warning' | 'danger';
