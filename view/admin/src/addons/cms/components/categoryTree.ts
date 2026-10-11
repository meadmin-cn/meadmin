import { cmsCategoryTypeLabel, type CmsCategoryInfo } from '../api/category';

/**
 * 各种内容可以关联的栏目类型（与后端校验保持一致）：
 * - 文章：1 文章列表 / 2 目录 / 6 下载列表（6 只收「可下载」且已上传文件的文章，后端强校验）
 * - 单页：5 单页
 * - 自定义表单：4 自定义表单
 * 其余类型（3 外链 等）不承载内容，只能在树里作为分组或置灰展示。
 */
export const cmsCategoryLinkableTypes = { article: [1, 2, 6], page: [5], diyform: [4] } as const;

export type CmsCategoryTreeNode = CmsCategoryInfo & { disabled?: boolean; children?: CmsCategoryTreeNode[] };

/**
 * 按「可关联类型」标记栏目树：允许类型内的节点可选，其余节点全部保留并置灰。
 * 保留完整层级是为了让运营看到栏目在树里的位置，置灰则明确表达「这类栏目不能挂当前内容」。
 */
export const markCategoryTree = (list: CmsCategoryInfo[] | undefined, allowTypes: readonly number[]): CmsCategoryTreeNode[] =>
  (list ?? []).map((node) => {
    const children = markCategoryTree(node.children, allowTypes);
    const linkable = allowTypes.includes(node.type ?? 1);
    return { ...node, ...(children.length ? { children } : {}), disabled: !linkable } as CmsCategoryTreeNode;
  });

/** 置灰节点的提示文案：说明为什么这个栏目不能选 */
export const cmsCategoryDisabledTip = (type?: number): string => `「${cmsCategoryTypeLabel(type)}」型栏目不能关联当前内容`;
