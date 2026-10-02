import request from '@/utils/request.js';

export interface CmsOrder {
  id: string;
  orderNo: string;
  articleId: string;
  userId: string | null;
  contactName: string;
  contactPhone: string;
  shippingAddress: string;
  itemName: string;
  quantity: number;
  amount: string;
  status: number;
  paymentStatus: number;
  shippingStatus: number;
  expressCompany: string;
  expressNo: string;
  shippedAt: string | null;
  receivedAt: string | null;
  paidAmount: string;
  paymentMethod: string;
  paymentNo: string;
  paidAt: string | null;
  completedAt: string | null;
  closedAt: string | null;
  lastFollowAt: string | null;
  nextFollowAt: string | null;
  adminRemark: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}
export interface CmsOrderLog {
  id: string;
  orderId: string;
  action: 'create' | 'edit' | 'pay' | 'ship' | 'receive' | 'follow' | 'complete' | 'close' | 'refund';
  content: string;
  nextFollowAt: string | null;
  createdAt: string;
  createdAdmin?: { id: string; username: string; nickname: string } | null;
}
export interface CmsOrderDetail {
  order: CmsOrder;
  article: { id: string; title: string; slug: string } | null;
  logs: CmsOrderLog[];
}
export interface CmsOrderSummary {
  total: number;
  pending: number;
  unpaid: number;
  toShip: number;
  shipped: number;
  completed: number;
  closed: number;
  paidAmount: number;
}
export interface CmsOrderQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: number;
  paymentStatus?: number;
  shippingStatus?: number;
  createdAt?: [string, string];
}
export type CmsOrderAction = 'edit' | 'pay' | 'ship' | 'receive' | 'follow' | 'complete' | 'close';

export const ORDER_STATUS = [
  { value: 0, label: '待处理', type: 'warning' },
  { value: 1, label: '处理中', type: 'primary' },
  { value: 2, label: '已完成', type: 'success' },
  { value: 3, label: '已关闭', type: 'info' },
] as const;
export const PAYMENT_STATUS = [
  { value: 0, label: '待收款', type: 'warning' },
  { value: 1, label: '已收款', type: 'success' },
  { value: 2, label: '已退款', type: 'info' },
] as const;
export const SHIPPING_STATUS = [
  { value: 0, label: '未发货', type: 'warning' },
  { value: 1, label: '已发货', type: 'primary' },
  { value: 2, label: '已签收', type: 'success' },
] as const;
export const PAYMENT_METHODS = [
  { value: 'bank', label: '银行转账' },
  { value: 'wechat', label: '微信' },
  { value: 'alipay', label: '支付宝' },
  { value: 'cash', label: '现金' },
  { value: 'other', label: '其他' },
] as const;
export const EXPRESS_COMPANIES = ['顺丰速运', '京东物流', '中通快递', '圆通速递', '韵达快递', '申通快递', 'EMS', '极兔速递', '德邦快递'];
export const LOG_ACTIONS: Record<CmsOrderLog['action'], { label: string; type: 'primary' | 'success' | 'warning' | 'danger' | 'info' }> = {
  create: { label: '下单', type: 'info' },
  edit: { label: '修改', type: 'info' },
  pay: { label: '收款', type: 'success' },
  ship: { label: '发货', type: 'primary' },
  receive: { label: '签收', type: 'success' },
  follow: { label: '跟进', type: 'warning' },
  complete: { label: '完成', type: 'success' },
  close: { label: '关闭', type: 'danger' },
  refund: { label: '退款', type: 'danger' },
};
export const findOption = <T extends { value: unknown }>(list: readonly T[], value: unknown) => list.find((item) => item.value === value);

export const listApi = () =>
  request<{ list: CmsOrder[]; total: number }, [CmsOrderQuery]>((data) => ({ url: 'addons/cms/order/', method: 'post', data }), {
    noLoading: true,
    clearEmpty: ['', undefined, null],
  });
export const summaryApi = () => request<CmsOrderSummary, []>(() => ({ url: 'addons/cms/order/summary', method: 'get' }), { noLoading: true });
export const infoApi = () => request<CmsOrderDetail, [string]>((id) => ({ url: 'addons/cms/order/info/' + id, method: 'get' }), { noLoading: true });
export const actionApi = () =>
  request<CmsOrder, [CmsOrderAction, string, Record<string, unknown>]>((action, id, data) => ({ url: `addons/cms/order/${action}/${id}`, method: 'post', data }), {
    success: true,
  });
export const deleteApi = () => request<boolean, [string[]]>((ids) => ({ url: 'addons/cms/order/delete', method: 'post', data: { ids } }), { success: true });
