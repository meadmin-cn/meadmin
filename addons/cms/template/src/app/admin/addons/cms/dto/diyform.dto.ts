import { AonCmsDiyform } from '@/entities/aonCmsDiyform.entity.js';
import { AonCmsDiyformData } from '@/entities/aonCmsDiyformData.entity.js';
import { PickDtoType } from '@/helper/dto.js';
import { RuleType } from '@/ruleType/index.js';

export class AonCmsDiyformSaveDto extends PickDtoType(AonCmsDiyform, ['title', 'diyname', 'description', 'fields', 'submitText', 'needReview', 'isMessageBoard', 'status', 'orderNum']) {}
export const diyformSchema: ReturnType<typeof RuleType.object> = RuleType.object({
  title: RuleType.string().max(100).trim().min(1).required(),
  diyname: RuleType.string()
    .max(120)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),
  description: RuleType.string().max(500).trim().allow('').default(''),
  fields: RuleType.string().max(50000).allow('').default('[]'),
  submitText: RuleType.string().max(60).trim().allow('').default(''),
  needReview: RuleType.number().integer().valid(0, 1).default(1),
  isMessageBoard: RuleType.boolean().default(false),
  status: RuleType.number().integer().valid(0, 1).default(1),
  orderNum: RuleType.number().integer().min(-9999).max(9999).default(0),
}).unknown(false);

export class AonCmsDiyformDataQueryDto {
  page: number;
  pageSize: number;
  formId?: string;
  diyname?: string;
  keyword?: string;
  status?: number;
}
export const diyformDataQuerySchema: ReturnType<typeof RuleType.object> = RuleType.object({
  page: RuleType.number().integer().min(1).default(1),
  pageSize: RuleType.number().integer().min(1).max(200).default(10),
  formId: RuleType.string().max(20).allow('').default(''),
  diyname: RuleType.string().max(120).allow('').default(''),
  keyword: RuleType.string().max(200).allow('').default(''),
  status: RuleType.number().integer().valid(0, 1, 2).allow(null).default(null),
}).unknown(false);

export class AonCmsDiyformDataUpdateDto extends PickDtoType(AonCmsDiyformData, ['status', 'reply']) {}
export const diyformDataUpdateSchema: ReturnType<typeof RuleType.object> = RuleType.object({
  status: RuleType.number().integer().valid(0, 1, 2).optional(),
  reply: RuleType.string().max(2000).allow('').optional(),
}).unknown(false);
