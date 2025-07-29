export type TreeArrayItem<T, C extends string | number> = { [K in C]: T[] } & T;
/**
 * 数组转为树结构
 * @param arr
 * @param key
 * @param parentKey
 * @param childrenKey
 * @returns
 */
export function listToTree<T extends Record<string, any>>(arr: T[], key: keyof T = 'id' as const, parentKey: keyof T = 'parentId' as const, childrenKey = 'children ' as const) {
  const treeNode = new Map();
  arr.forEach((item) => {
    treeNode.set(item[key], Object.assign({}, item, { [childrenKey]: [] }));
  });
  const rootArr = [] as Array<TreeArrayItem<T, typeof childrenKey>>;
  arr.forEach((item) => {
    const parentNode = treeNode.get(item[parentKey]);
    if (parentNode) {
      parentNode[childrenKey].push(item);
      treeNode.delete(item[key]);
    } else {
      rootArr.push(treeNode.get(item[key]));
    }
  });
  return rootArr;
}
