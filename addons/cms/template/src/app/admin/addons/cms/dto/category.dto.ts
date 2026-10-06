import { AonCmsCategory } from '@/entities/aonCmsCategory.entity.js';
import { PickDtoType } from '@/helper/dto.js';
import { RuleType } from '@/ruleType/index.js';
export class AonCmsCategorySaveDto extends PickDtoType(AonCmsCategory, ['title', 'slug', 'status', 'orderNum', 'parentId', 'type', 'linkUrl', 'target', 'isNav', 'isRecommend', 'coverUrl']) {}
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
  type: RuleType.number().integer().valid(1, 2, 3, 4, 5).default(1),
  linkUrl: RuleType.string()
    .max(1000)
    .pattern(/^(?:https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/)
    .allow('')
    .default(''),
  target: RuleType.string().max(200).allow('').default(''),
  isNav: RuleType.boolean().default(true),
  isRecommend: RuleType.boolean().default(false),
  coverUrl: RuleType.string()
    .max(1000)
    .pattern(/^(?:https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/)
    .allow('')
    .default(''),
}).unknown(false);
