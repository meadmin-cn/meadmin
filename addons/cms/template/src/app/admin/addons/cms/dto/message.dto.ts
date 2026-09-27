import { RuleType } from '@/ruleType/index.js';
export interface CmsMessageSaveDto {
  author: string;
  contact: string;
  content: string;
  reply?: string;
  status?: number;
}
export const messageSchema: ReturnType<typeof RuleType.object> = RuleType.object({ author: RuleType.string().max(80).trim().min(1).required(), contact: RuleType.string().max(120).trim().allow('').default(''), content: RuleType.string().max(2000).trim().min(1).required(), reply: RuleType.string().max(2000).allow('').default(''), status: RuleType.number().integer().valid(0, 1, 2).default(0) }).unknown(false);
