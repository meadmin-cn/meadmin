import { RuleType } from '@/ruleType/index.js';
export interface CmsDownloadSaveDto {
  title: string;
  slug: string;
  category: string;
  version: string;
  summary: string;
  mdContent: string;
  coverUrl: string;
  fileUrl: string;
  status: number;
  orderNum: number;
}
export const downloadSchema: ReturnType<typeof RuleType.object> = RuleType.object({
  title: RuleType.string().max(200).trim().min(1).required(),
  slug: RuleType.string()
    .max(120)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),
  category: RuleType.string().max(80).trim().allow('').default(''),
  version: RuleType.string().max(50).trim().allow('').default(''),
  summary: RuleType.string().max(1000).allow('').default(''),
  mdContent: RuleType.string().max(200000).allow('').default(''),
  coverUrl: RuleType.string()
    .max(1000)
    .pattern(/^(?:https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/)
    .allow('')
    .default(''),
  fileUrl: RuleType.string()
    .max(1000)
    .pattern(/^(?:https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/)
    .required(),
  status: RuleType.number().integer().valid(0, 1).default(1),
  orderNum: RuleType.number().integer().min(-9999).max(9999).default(0),
}).unknown(false);
