import { formatWithArray, formatWithObject } from '@midwayjs/i18n/dist/utils.js';
import { clone } from 'lodash-es';

export type TreeArrayItem<T, C extends string> = T & { 
  [K in C]: TreeArrayItem<T, C>[] 
};

/**
 * 数组转为树结构
 * @param arr 源数组
 * @param key 主键字段名，默认为 'id'
 * @param parentKey 父级ID字段名，默认为 'parentId'
 * @param childrenKey 子节点字段名，默认为 'children'
 * @returns 树形结构数组
 */
export function listToTree<
  T extends Record<string | number | symbol, any>,
  K extends keyof T = 'id',
  P extends keyof T = 'parentId',
  C extends string = 'children'
>(
  arr: T[], 
  key: K = 'id' as K, 
  parentKey: P = 'parentId' as P, 
  childrenKey: C = 'children' as C
): TreeArrayItem<T, C>[] {
  // 使用 unknown 作为 Map 的键类型，因为 T[K] 和 T[P] 可能不兼容
  const treeNode = new Map<unknown, T & Record<C, any[]>>();
  
  // 深拷贝数组
  const newArr = clone(arr);
  
  // 初始化节点并添加children属性
  newArr.forEach((item) => {
    // 使用类型断言确保类型安全
    const itemWithChildren = item as T & Record<C, any[]>;
    itemWithChildren[childrenKey] = [] as (T & Record<C, any[]>)[C];
    // 使用 item[key] 作为键，但转换为 unknown 类型
    treeNode.set(item[key] as unknown, itemWithChildren);
  });
  
  // 创建根节点数组
  const rootArr: TreeArrayItem<T, C>[] = [];
  
  // 构建树结构
  arr.forEach((item) => {
    const parentValue = item[parentKey];
    
    // 尝试获取父节点，使用 unknown 类型进行查找
    const parentNode = treeNode.get(parentValue as unknown);
    
    if (parentNode) {
      // 确保 parentNode 有 children 属性
      parentNode[childrenKey].push(item as T & Record<C, any[]>);
    } else {
      // 获取当前节点
      const node = treeNode.get(item[key] as unknown);
      if (node) {
        // 检查节点是否已经是根节点（避免重复添加）
        const isRoot = !rootArr.some(root => root[key] === node[key]);
        if (isRoot) {
          // 转换为正确的树节点类型
          rootArr.push(node as TreeArrayItem<T, C>);
        }
      }
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
      const start = stack.pop() || 0;
      result.push(text.substring(start + 1, i));
    }
  }
  return result;
}

export function formatText(message: string, args: Array<string | number> | Record<string, string | number>) {
  if (Array.isArray(args)) {
    return formatWithArray(message, args);
  } else {
    return formatWithObject(message, args);
  }
}
