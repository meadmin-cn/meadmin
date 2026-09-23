import { AonCmsArticle } from '@/entities/aonCmsArticle.entity.js';
import { PickDtoType } from '@/helper/dto.js';
import { RuleType } from '@/ruleType/index.js';
export class AonCmsArticleSaveDto extends PickDtoType(AonCmsArticle, ['title', 'slug', 'summary', 'mdContent', 'coverUrl', 'seoTitle', 'seoKeywords', 'seoDescription', 'publishAt', 'orderNum', 'categoryId', 'topicId', 'tagIds', 'orderEnabled']) {}
export const articleSchema: ReturnType<typeof RuleType.object> = RuleType.object({
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
  seoTitle: RuleType.string().max(200).allow('').default(''),
  seoKeywords: RuleType.string().max(200).allow('').default(''),
  seoDescription: RuleType.string().max(500).allow('').default(''),
  publishAt: RuleType.date().iso().allow(null).default(null),
  orderNum: RuleType.number().integer().min(-9999).max(9999).default(0),
  categoryId: RuleType.string()
    .pattern(/^[0-9]{1,20}$/)
    .allow(null)
    .default(null),
  topicId: RuleType.string()
    .pattern(/^[0-9]{1,20}$/)
    .allow(null)
    .default(null),
  tagIds: RuleType.array()
    .items(RuleType.string().pattern(/^[0-9]{1,20}$/))
    .unique()
    .max(30)
    .default([]),
  orderEnabled: RuleType.boolean().default(false),
}).unknown(false);
