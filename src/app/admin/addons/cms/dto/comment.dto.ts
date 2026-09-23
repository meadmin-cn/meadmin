import { AonCmsComment } from '@/entities/aonCmsComment.entity.js';
import { PickDtoType } from '@/helper/dto.js';
import { RuleType } from '@/ruleType/index.js';
export class AonCmsCommentSaveDto extends PickDtoType(AonCmsComment, ['articleId', 'author', 'content', 'parentId']) {}
export class CmsPublicCommentDto extends PickDtoType(AonCmsComment, ['content', 'parentId']) {}
export const publicCommentSchema: ReturnType<typeof RuleType.object> = RuleType.object({
  content: RuleType.string().max(2000).trim().min(1).required(),
  parentId: RuleType.string().pattern(/^[0-9]{1,20}$/).allow(null, ''),
}).unknown(false);

export const publicCommentReportSchema: ReturnType<typeof RuleType.object> = RuleType.object({
  reason: RuleType.string().max(500).trim().min(1).required(),
}).unknown(false);

export const commentSchema: ReturnType<typeof RuleType.object> = RuleType.object({
  articleId: RuleType.string().pattern(/^[0-9]{1,20}$/).required(),
  author: RuleType.string().max(80).trim().min(1).required(),
  content: RuleType.string().max(2000).trim().min(1).required(),
  parentId: RuleType.string().pattern(/^[0-9]{1,20}$/).allow(null, ''),
}).unknown(false);
