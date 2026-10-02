import { AonCmsBlock } from '@/entities/aonCmsBlock.entity.js';
import { PickDtoType } from '@/helper/dto.js';
import { RuleType } from '@/ruleType/index.js';
import { cmsBlockKindOf, cmsBlockPositionValues } from '../dict/blockPosition.dict.js';
export class AonCmsBlockSaveDto extends PickDtoType(AonCmsBlock, ['title', 'displayTitle', 'slug', 'position', 'mdContent', 'coverUrl', 'link', 'status', 'startAt', 'endAt', 'orderNum', 'config']) {}
export const blockSchema: ReturnType<typeof RuleType.object> = RuleType.object({
  title: RuleType.string().max(200).trim().min(1).required(),
  displayTitle: RuleType.string().max(200).trim().allow('').default(''),
  slug: RuleType.string()
    .max(120)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),
  position: RuleType.string()
    .max(100)
    .valid(...cmsBlockPositionValues)
    .required(),
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
  config: RuleType.string().max(20000).allow('').default(''),
}).unknown(false);

/** 由展示位置推导区块类型（1区块 2轮播 3广告），用于兼容旧数据与前台渲染 */
export const blockKindFromPosition = (position: string): number => cmsBlockKindOf(position);
