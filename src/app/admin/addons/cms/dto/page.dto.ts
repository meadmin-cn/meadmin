import { AonCmsPage } from '@/entities/aonCmsPage.entity.js';
import { PickDtoType } from '@/helper/dto.js';
import { RuleType } from '@/ruleType/index.js';
export class AonCmsPageSaveDto extends PickDtoType(AonCmsPage, ['title', 'slug', 'summary', 'mdContent', 'coverUrl', 'kind', 'link', 'target', 'seoTitle', 'seoKeywords', 'seoDescription', 'publishAt', 'orderNum']) {}
export const pageSchema: ReturnType<typeof RuleType.object> = RuleType.object({
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
  kind: RuleType.number().integer().valid(1, 2).default(1),
  link: RuleType.string()
    .max(1000)
    .pattern(/^https?:\/\/[^\s]+$/)
    .allow('')
    .default(''),
  target: RuleType.number().integer().valid(0, 1).default(0),
  seoTitle: RuleType.string().max(200).allow('').default(''),
  seoKeywords: RuleType.string().max(200).allow('').default(''),
  seoDescription: RuleType.string().max(500).allow('').default(''),
  publishAt: RuleType.date().iso().allow(null).default(null),
  orderNum: RuleType.number().integer().min(-9999).max(9999).default(0),
}).unknown(false);
