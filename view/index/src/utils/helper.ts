import dayjs from 'dayjs';
import { clone, cloneDeep } from 'lodash-es';
import { SearchTreeOptions, default as XEUtils } from 'xe-utils';

/**
 * 对象中的每个可便利元素按序执行一个由您提供的 reducer 函数，
 * 每一次运行 reducer 会将先前元素的计算结果作为参数传入，
 * 最后将其结果汇总为单个返回值。
 * @param object 用户遍历的对象
 * @param callbackfn  “reducer” 函数，包含四个参数：
 *  previousValue：上一次调用 callbackFn 时的返回值。在第一次调用时，其值则为 initialValue。
 *  currentValue：数组中正在处理的元素。
 *  currentKey：数组中正在处理的元素的key。
 *  object：用于遍历的d对象。
 * @param initialValue  作为第一次调用 callback 函数时参数 previousValue 的值
 * @returns
 */
export function objectRreduce<T, P extends Record<string, any> = Record<string, any>>(
  object: P,
  callbackfn: (previousValue: T, currentValue: P[keyof P], currentKey: string, object: P) => T,
  initialValue: T,
): T {
  for (const i in object) {
    if (Object.hasOwn(object, i)) {
      initialValue = callbackfn(initialValue, object[i], i, object);
    }
  }
  return initialValue;
}

/**
 * 合并对象的value（value必须为数组）
 * @param object
 * @returns
 */
export function concatObjectValue<T, P extends Record<string, T[]> = Record<string, T[]>>(object: P) {
  return objectRreduce(
    object,
    (currentValue, previousValue) => {
      return currentValue.concat(previousValue || []);
    },
    [] as T[],
  );
}

/**
 * 文件名转驼峰
 * @param fileName
 * @param nameTemplate
 * @returns
 */
export const fileToHump = function (fileName: string): string {
  const index = fileName.lastIndexOf('.');
  if (index > 0) {
    fileName = fileName.slice(0, index);
  }
  const fileNameArr = fileName.replace(/\\/g, '/').split('/');
  if (fileNameArr[fileNameArr.length - 1] === 'index' || fileNameArr[fileNameArr.length - 1] === 'Index') {
    fileNameArr.pop();
  }
  for (let i = 1, len = fileNameArr.length; i < len; i++) {
    fileNameArr[i] = fileNameArr[i].slice(0, 1).toUpperCase() + fileNameArr[i].slice(1);
  }
  return fileNameArr.join('');
};

/**
 * 混色
 * @param color1  16进制颜色1
 * @param color2  16进制颜色2
 * @param opacity 透明度0-1
 * @returns
 */
export const mixColor = function (color1: string, color2: string, opacity: number) {
  let red1 = parseInt(color1.slice(1, 3), 16);
  let green1 = parseInt(color1.slice(3, 5), 16);
  let blue1 = parseInt(color1.slice(5, 7), 16);
  if (opacity === 0) {
    return [red1, green1, blue1].toString();
  }
  const red2 = parseInt(color2.slice(1, 3), 16);
  const green2 = parseInt(color2.slice(3, 5), 16);
  const blue2 = parseInt(color2.slice(5, 7), 16);
  red1 += Math.round(opacity * (red2 - red1));
  green1 += Math.round(opacity * (green2 - green1));
  blue1 += Math.round(opacity * (blue2 - blue1));
  return '#' + red1.toString(16) + green1.toString(16) + blue1.toString(16);
};

/**
 * 获取灰阶值 越小颜色越深
 * @param color
 * @returns
 */
export const getColorLuma = function (color: string) {
  const red = parseInt(color.slice(1, 3), 16);
  const green = parseInt(color.slice(3, 5), 16);
  const blue = parseInt(color.slice(5, 7), 16);
  return red * 0.299 + green * 0.587 + blue * 0.114;
};

/**
 * 树形结构搜索
 */
type TreeData<Key extends string[]> = {
  [k in Key[number]]: string | number;
} & { [k: string]: any };
export const searchTreeTable = function <Key extends string[], T extends TreeData<Key>>(
  searchText: number | string,
  searchProps: Key,
  data: T[],
  options: SearchTreeOptions = { children: 'children' },
  formatStr = (str: string, filterRE: RegExp) => str.replace(filterRE, (match) => `<span class="keyword-lighten">${match}</span>`),
) {
  const search = XEUtils.toValueString(searchText).trim().toLowerCase();
  if (search) {
    const filterRE = new RegExp(search, 'gi');
    const rest = XEUtils.searchTree(data, (item) => searchProps.some((key) => XEUtils.toValueString(item[key]).toLowerCase().indexOf(search) > -1), options);
    XEUtils.eachTree(
      rest,
      (item) => {
        searchProps.forEach((key: Key[number]) => {
          item[key] = formatStr(XEUtils.toValueString(item[key]), filterRE) as T[Key[number]];
        });
      },
      options,
    );
    return rest;
  }
  return cloneDeep(data);
};

/**
 * 递归代理对象/数组,响应后触发update方法
 * @param value
 * @param update
 * @returns
 */
export const proxyValue = <T extends Record<string | number, any> | any[]>(value: T, update: () => void): T => {
  return new Proxy<T>(value, {
    get: function (obj, prop) {
      if (obj[prop as keyof T] && typeof obj[prop as keyof T] === 'object') {
        return proxyValue(obj[prop as keyof T] as T, update);
      }
      return obj[prop as keyof T];
    },
    set: function (obj, prop, value) {
      const oldV = obj[prop as keyof T];
      obj[prop as keyof T] = value;
      update();
      setTimeout(() => (obj[prop as keyof T] = oldV));
      return true;
    },
  });
};

export type TreeArrayItem<T, C extends string | number> = { [K in C]: TreeArrayItem<T, C>[] } & T;
/**
 * 数组转为树结构
 * @param arr
 * @param key
 * @param parentKey
 * @param childrenKey
 * @returns
 */
export const listToTree = <T extends Record<string, any>>(arr: T[], key: keyof T = 'id' as const, parentKey: keyof T = 'parentId' as const, childrenKey = 'children' as const) => {
  const treeNode = new Map();
  const newArr = clone(arr);
  newArr.forEach((item) => {
    (item as any)[childrenKey] = [];
    treeNode.set(item[key], item);
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
};

/**
 * 状态转boolean
 * @param status
 * @returns
 */
export const statusToBoolean = (status?: 0 | 1 | '0' | '1') => {
  if (status === undefined) {
    return undefined;
  }

  return status == '1';
};

/**
 * 重置对象值，会改变原对象
 * @param obj
 * @param fromObj
 * @returns
 */
export const resetObj = <T extends Record<any, any>>(obj: Record<any, any>, fromObj: T) => {
  Object.keys(obj).forEach((key) => (obj[key] = undefined));
  Object.assign(obj, fromObj);
  return obj as T;
};

/**
 * 递归去除数组/对象的空值值
 * @param obj
 * @returns
 */
export function clearEmptyParam<T extends Record<any, any> | any[]>(obj: T, emptyArr = [null, undefined]) {
  if (Array.isArray(obj)) {
    const newObj = [] as any[];
    obj.forEach((item) => {
      if (emptyArr.includes(item)) {
        return;
      } else if (Array.isArray(item)) {
        newObj.push(clearEmptyParam(item));
      } else if (typeof item === 'object') {
        newObj.push(clearEmptyParam(item));
      } else {
        newObj.push(item);
      }
    });
    return newObj;
  } else {
    const newObj = {} as Record<any, any>;
    Object.keys(obj).forEach((key) => {
      if (emptyArr.includes(obj[key])) {
        return;
      } else if (Array.isArray(obj[key])) {
        newObj[key] = clearEmptyParam(obj[key]);
      } else if (typeof obj[key] === 'object') {
        newObj[key] = clearEmptyParam(obj[key]);
      } else {
        newObj[key] = obj[key];
      }
    });
    return newObj;
  }
}

//格式化表格数据
export function formatterStr<T>({ cellValue }: { cellValue: T }) {
  return [undefined, null, ''].includes(cellValue as any) ? '--' : (cellValue as T extends undefined | null ? string : T);
}
//格式化表格时间数据
export function formatterAt<T extends string | null | undefined | Date>({ cellValue }: { cellValue: T }, formatStr = 'YYYY-MM-DD HH:mm:ss') {
  return cellValue ? dayjs(cellValue).format(formatStr) : formatterStr({ cellValue });
}

//根据文件名判断是否是图片
export function isImage(filename: string) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const fileExtension = filename.split('.').pop()?.toLowerCase();
  return fileExtension ? imageExtensions.includes(fileExtension) : false;
}
