import { AonCmsBlock } from '@/entities/aonCmsBlock.entity.js';
import { PickDtoType } from '@/helper/dto.js';
import { RuleType } from '@/ruleType/index.js';
export class AonCmsBlockSaveDto extends PickDtoType(AonCmsBlock, ['title', 'slug', 'position', 'kind', 'mdContent', 'coverUrl', 'link', 'status', 'startAt', 'endAt', 'orderNum']) {}
export const blockSchema: ReturnType<typeof RuleType.object> = RuleType.object({
  title: RuleType.string().max(200).trim().min(1).required(),
  slug: RuleType.string()
    .max(120)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),
  position: RuleType.string()
    .max(100)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),
  kind: RuleType.number().integer().valid(1, 2, 3).default(1),
  mdContent: RuleType.string().max(200000).allow('').default(''),
  coverUrl: RuleType.string()
    .max(1000)
    .pattern(/^(?:https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/)
    .allow('')
    .default(''),
  link: RuleType.string()
    .max(1000)
    .pattern(/^(?:https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/)
    .allow('')
    .default(''),
  status: RuleType.number().integer().valid(0, 1).default(1),
  startAt: RuleType.date().iso().allow(null).default(null),
  endAt: RuleType.date().iso().allow(null).default(null),
  orderNum: RuleType.number().integer().min(-9999).max(9999).default(0),
}).unknown(false);
