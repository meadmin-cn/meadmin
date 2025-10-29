import { clone } from "lodash-es";

export type TreeArrayItem<T, C extends string | number> = { [K in C]: TreeArrayItem<T, C>[] } & T;
/**
 * 数组转为树结构
 * @param arr
 * @param key
 * @param parentKey
 * @param childrenKey
 * @returns
 */
export function listToTree<T extends Record<string, any>>(arr: T[], key: keyof T = 'id' as const, parentKey: keyof T = 'parentId' as const, childrenKey = 'children' as const) {
  const treeNode = new Map();
  const newArr = clone(arr);
  newArr.forEach((item) => {
    (item as any)[childrenKey] = [];
    treeNode.set(item[key],item);
  });
  const rootArr = [] as Array<TreeArrayItem<T, typeof childrenKey>>;
  arr.forEach((item) => {
    const parentNode = treeNode.get(item[parentKey]);
    if (parentNode) {
      parentNode[childrenKey].push(item);
    } else {
      rootArr.push(treeNode.get(item[key]));
    }
  });
  return rootArr;
}

/**
 * 提取大括号内容
 * @param text 监测的值
 * @returns 
 */
export function extractBracesContent(text: string) {
  const result = [];
  const stack = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      stack.push(i);
    } else if (text[i] === '}' && stack.length > 0) {
      const start = stack.pop();
      result.push(text.substring(start + 1, i));
    }
  }
  return result;
}

