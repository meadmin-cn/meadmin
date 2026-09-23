import { AonCmsTag } from '@/entities/aonCmsTag.entity.js';
import { PickDtoType } from '@/helper/dto.js';
import { RuleType } from '@/ruleType/index.js';
export class AonCmsTagSaveDto extends PickDtoType(AonCmsTag, ['title', 'slug', 'status', 'orderNum']) {}
export const tagSchema: ReturnType<typeof RuleType.object> = RuleType.object({
  title: RuleType.string().max(100).trim().min(1).required(),
  slug: RuleType.string()
    .max(120)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),
  status: RuleType.number().integer().valid(0, 1).default(1),
  orderNum: RuleType.number().integer().min(-9999).max(9999).default(0),
}).unknown(false);
