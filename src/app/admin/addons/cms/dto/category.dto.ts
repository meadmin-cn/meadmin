import { AonCmsCategory } from '@/entities/aonCmsCategory.entity.js';
import { PickDtoType } from '@/helper/dto.js';
import { RuleType } from '@/ruleType/index.js';
export class AonCmsCategorySaveDto extends PickDtoType(AonCmsCategory, ['title', 'slug', 'status', 'orderNum', 'parentId']) {}
export const categorySchema: ReturnType<typeof RuleType.object> = RuleType.object({
  title: RuleType.string().max(100).trim().min(1).required(),
  slug: RuleType.string()
    .max(120)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),
  status: RuleType.number().integer().valid(0, 1).default(1),
  orderNum: RuleType.number().integer().min(-9999).max(9999).default(0),
  parentId: RuleType.string()
    .pattern(/^[0-9]{1,20}$/)
    .allow(null)
    .default(null),
}).unknown(false);
