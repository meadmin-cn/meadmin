import type { CmsOrder, CmsOrderAction } from '../../../api/order';

type StatusOption = { readonly value: number; readonly label: string; readonly type: string };
export const statusOf = <T extends StatusOption>(list: readonly T[], value: number) =>
  (list.find((item) => item.value === value) ?? { value, label: String(value), type: 'info' }) as { value: number; label: string; type: 'primary' | 'success' | 'warning' | 'info' | 'danger' };

const pad = (n: number) => String(n).padStart(2, '0');
export const formatTime = (value?: string | null) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** 与后端状态机保持一致：返回订单当前可执行的操作 */
export const availableActions = (o: CmsOrder): CmsOrderAction[] => {
  const open = o.status === 0 || o.status === 1;
  const list: CmsOrderAction[] = [];
  if (open && o.paymentStatus !== 1) list.push('pay');
  if (open && o.shippingStatus !== 2) list.push('ship');
  if (open && o.shippingStatus === 1) list.push('receive');
  list.push('follow');
  if (open) list.push('edit');
  if (open && o.paymentStatus === 1 && o.shippingStatus !== 0) list.push('complete');
  if (open && o.shippingStatus === 0) list.push('close');
  return list;
};
