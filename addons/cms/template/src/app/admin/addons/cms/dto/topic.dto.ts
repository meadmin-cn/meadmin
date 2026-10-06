import { AonCmsTopic } from '@/entities/aonCmsTopic.entity.js';
import { PickDtoType } from '@/helper/dto.js';
import { RuleType } from '@/ruleType/index.js';
export class AonCmsTopicSaveDto extends PickDtoType(AonCmsTopic, ['title', 'slug', 'summary', 'mdContent', 'coverUrl', 'status', 'orderNum', 'type', 'target', 'targetBlank']) {}
export const topicSchema: ReturnType<typeof RuleType.object> = RuleType.object({
  title: RuleType.string().max(200).trim().min(1).required(),
  slug: RuleType.string()
    .max(120)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),
  summary: RuleType.string().max(1000).allow('').default(''),
  mdContent: RuleType.string().max(200000).allow('').default(''),
  coverUrl: RuleType.string()
    .max(1000)
    .pattern(/^(?:https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/)
    .allow('')
    .default(''),
  status: RuleType.number().integer().valid(0, 1).default(1),
  orderNum: RuleType.number().integer().min(-9999).max(9999).default(0),
  type: RuleType.number().integer().valid(1, 2, 3, 4, 5, 6).default(1),
  target: RuleType.string().max(200).allow('').default(''),
  targetBlank: RuleType.number().integer().valid(0, 1).default(0),
}).unknown(false);
