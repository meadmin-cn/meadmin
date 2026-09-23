import { RuleType } from '@/ruleType/index.js';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
type ObjectSchema = ReturnType<typeof RuleType.object>;

export const validateCms = <T>(schema: ObjectSchema, data: unknown): T => {
  const { error, value } = schema.validate(data, { abortEarly: true, stripUnknown: false, convert: true });
  if (error) throw new BadRequestError(error.message);
  return value as T;
};
export const cmsId = (id: string) => {
  const { error } = RuleType.string()
    .pattern(/^[0-9]{1,20}$/)
    .required()
    .validate(id);
  if (error) throw new BadRequestError('无效的 CMS ID');
  return id;
};
export const assertCmsParent = (id: string | undefined, parentId: string | null | undefined, rows: Array<{ id: string; parentId: string | null }>) => {
  const seen = new Set<string>(id ? [id] : []);
  const parents = new Map(rows.map((row) => [row.id, row.parentId]));
  let current = parentId;
  while (current) {
    if (seen.has(current)) throw new BadRequestError('栏目不能形成循环');
    if (!parents.has(current)) throw new BadRequestError('父栏目不存在');
    seen.add(current);
    current = parents.get(current);
  }
};
// 内容状态：0草稿、1待审核、2发布、3拒绝、4下线。
export const canSubmitCms = (status: number) => [0, 3, 4].includes(status);
export const isCmsVisible = (status: number, publishAt: Date | string | null, now = new Date()) => status === 2 && publishAt !== null && new Date(publishAt).getTime() <= now.getTime();
