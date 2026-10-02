import { RuleType } from '@/ruleType/index.js';

export interface CmsOrderCreateDto {
  contactName: string;
  contactPhone: string;
  shippingAddress: string;
  quantity: number;
  remark?: string;
}
export const orderCreateSchema: ReturnType<typeof RuleType.object> = RuleType.object({
  contactName: RuleType.string().max(80).trim().min(1).required(),
  contactPhone: RuleType.string().max(30).trim().min(5).required(),
  shippingAddress: RuleType.string().max(500).trim().min(5).required(),
  quantity: RuleType.number().integer().min(1).max(999).default(1),
  remark: RuleType.string().max(500).allow('', null).default(''),
}).unknown(false);

export interface CmsOrderQueryDto {
  orderNo: string;
  contactPhone: string;
}
export const orderQuerySchema: ReturnType<typeof RuleType.object> = RuleType.object({
  orderNo: RuleType.string().max(32).trim().min(4).required(),
  contactPhone: RuleType.string().max(30).trim().min(5).required(),
}).unknown(false);

const id = RuleType.string().pattern(/^[0-9]{1,20}$/);
const date = RuleType.date().allow(null, '');

/** 后台订单列表查询 */
export interface CmsAdminOrderListDto {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: number;
  paymentStatus?: number;
  shippingStatus?: number;
  articleId?: string;
  createdAt?: [string, string];
}
export const adminOrderListSchema: ReturnType<typeof RuleType.object> = RuleType.object({
  page: RuleType.number().integer().min(1).max(100000).default(1),
  pageSize: RuleType.number().integer().min(1).max(100).default(20),
  keyword: RuleType.string().max(100).trim().allow(''),
  status: RuleType.number().integer().valid(0, 1, 2, 3),
  paymentStatus: RuleType.number().integer().valid(0, 1, 2),
  shippingStatus: RuleType.number().integer().valid(0, 1, 2),
  articleId: id,
  createdAt: RuleType.array().items(RuleType.date()).length(2),
}).unknown(false);

/** 编辑订单基础信息（收件信息、金额、备注） */
export interface CmsOrderEditDto {
  contactName: string;
  contactPhone: string;
  shippingAddress: string;
  quantity: number;
  amount: number;
  adminRemark?: string;
}
export const orderEditSchema: ReturnType<typeof RuleType.object> = RuleType.object({
  contactName: RuleType.string().max(80).trim().min(1).required(),
  contactPhone: RuleType.string().max(30).trim().min(5).required(),
  shippingAddress: RuleType.string().max(500).trim().min(5).required(),
  quantity: RuleType.number().integer().min(1).max(999).required(),
  amount: RuleType.number().min(0).max(9999999999).precision(2).required(),
  adminRemark: RuleType.string().max(1000).allow('').default(''),
}).unknown(false);

/** 确认线下收款 */
export interface CmsOrderPayDto {
  paidAmount: number;
  paymentMethod: string;
  paymentNo?: string;
  paidAt?: Date | null;
  content?: string;
}
export const orderPaySchema: ReturnType<typeof RuleType.object> = RuleType.object({
  paidAmount: RuleType.number().min(0).max(9999999999).precision(2).required(),
  paymentMethod: RuleType.string().valid('bank', 'wechat', 'alipay', 'cash', 'other').required(),
  paymentNo: RuleType.string().max(80).trim().allow('').default(''),
  paidAt: date,
  content: RuleType.string().max(1000).allow('').default(''),
}).unknown(false);

/** 发货 / 修改快递信息 */
export interface CmsOrderShipDto {
  expressCompany: string;
  expressNo: string;
  shippedAt?: Date | null;
  content?: string;
}
export const orderShipSchema: ReturnType<typeof RuleType.object> = RuleType.object({
  expressCompany: RuleType.string().max(60).trim().min(1).required(),
  expressNo: RuleType.string()
    .max(60)
    .trim()
    .min(3)
    .pattern(/^[A-Za-z0-9-]+$/)
    .required(),
  shippedAt: date,
  content: RuleType.string().max(1000).allow('').default(''),
}).unknown(false);

/** 跟进记录 */
export interface CmsOrderFollowDto {
  content: string;
  nextFollowAt?: Date | null;
}
export const orderFollowSchema: ReturnType<typeof RuleType.object> = RuleType.object({
  content: RuleType.string().max(1000).trim().min(1).required(),
  nextFollowAt: date,
}).unknown(false);

/** 完成 / 关闭 / 签收 / 退款 需要的说明 */
export interface CmsOrderReasonDto {
  content?: string;
}
export const orderReasonSchema: ReturnType<typeof RuleType.object> = RuleType.object({
  content: RuleType.string().max(1000).allow('').default(''),
}).unknown(false);
