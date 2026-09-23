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

export const orderStatusSchema: ReturnType<typeof RuleType.object> = RuleType.object({
  status: RuleType.number().integer().valid(0, 1, 2, 3).required(),
  paymentStatus: RuleType.number().integer().valid(0, 1, 2).required(),
}).unknown(false);
