import type { RowValues } from './pgDump.js';

/** 插件清理规则 */
export type AddonRuleOptions = {
  /** 插件表前缀，默认 aon_ */
  tablePrefix?: string;
  /** 插件根菜单的规则前缀，默认 addons_ */
  menuRootPrefix?: string;
  /** 保留的插件标识（如 cms），默认全部移除 */
  keepAddons?: string[];
};

export type MenuCleanResult = {
  /** 清理后的菜单行 */
  rows: RowValues[];
  /** 被移除的菜单 id */
  removedIds: Set<string>;
  /** 被移除的插件根菜单 */
  removedRoots: RowValues[];
  /** 清理前的菜单总数 */
  total: number;
};

const normalize = (value: string) => value.toLowerCase();

const keepSet = (options: AddonRuleOptions) => new Set((options.keepAddons ?? []).map((item) => normalize(item)));

/**
 * 从表名解析插件标识：aon_cms_article → cms
 */
export const parseAddonOfTable = (table: string, prefix = 'aon_') => normalize(table.slice(prefix.length).split('_')[0] ?? '');

/**
 * 从权限规则解析插件标识：addons_cms → cms、aon_cms_article → cms
 */
const addonNameOfRule = (rule: string, tablePrefix: string, rootPrefix: string) => {
  if (rule.startsWith(rootPrefix)) return normalize(rule.slice(rootPrefix.length).split('_')[0] ?? '');
  if (rule.startsWith(tablePrefix)) return normalize(rule.slice(tablePrefix.length).split('_')[0] ?? '');
  return '';
};

/**
 * 是否为插件表：以插件前缀开头，且不属于需要保留的插件。
 */
export const isAddonTable = (table: string, options: AddonRuleOptions = {}) => {
  const prefix = options.tablePrefix ?? 'aon_';
  if (!table.startsWith(prefix)) return false;
  return !keepSet(options).has(parseAddonOfTable(table, prefix));
};

/** 子级排序：排序值降序（与后台树形展示一致），相同则按 id 升序，保证多次导出结果稳定 */
const compareNode = (a: RowValues, b: RowValues) => {
  const diff = Number(b.order_num ?? 0) - Number(a.order_num ?? 0);
  if (diff) return diff;
  return (a.id ?? '').localeCompare(b.id ?? '');
};

/**
 * 按 parent_id 重新计算整棵嵌套集树的 left / right。
 * 遍历规则与 AdminTreeModel.perfectTree 一致：进入节点写 left，全部子级处理完写 right。
 */
const rebuildNestedSet = (rows: RowValues[]) => {
  const ids = new Set(rows.map((row) => row.id ?? ''));
  const childrenOf = new Map<string, RowValues[]>();
  const roots: RowValues[] = [];
  rows.forEach((row) => {
    const id = row.id ?? '';
    const parent = row.parent_id ?? '';
    //父级为空、父级已被移除或自身成环时，按根节点处理
    if (!parent || !ids.has(parent) || parent === id) {
      roots.push(row);
      return;
    }
    const list = childrenOf.get(parent) ?? [];
    list.push(row);
    childrenOf.set(parent, list);
  });
  roots.sort(compareNode);
  childrenOf.forEach((list) => list.sort(compareNode));
  let position = 1;
  let visited = 0;
  const visit = (row: RowValues) => {
    visited++;
    const left = position++;
    (childrenOf.get(row.id ?? '') ?? []).forEach(visit);
    row.left = String(left);
    row.right = String(position++);
  };
  roots.forEach(visit);
  return visited;
};

/**
 * 收集需要移除的插件菜单：插件根菜单（addons_ 开头）连同其全部后代，
 * 以及规则直接以插件前缀命名的历史残留菜单。
 */
export const collectAddonMenuIds = (rows: RowValues[], options: AddonRuleOptions = {}) => {
  const tablePrefix = options.tablePrefix ?? 'aon_';
  const rootPrefix = options.menuRootPrefix ?? 'addons_';
  const keep = keepSet(options);
  const childrenOf = new Map<string, string[]>();
  rows.forEach((row) => {
    const parent = row.parent_id ?? '';
    const list = childrenOf.get(parent) ?? [];
    list.push(row.id ?? '');
    childrenOf.set(parent, list);
  });
  const removedIds = new Set<string>();
  const removedRoots: RowValues[] = [];
  const removeWithChildren = (id: string) => {
    if (!id || removedIds.has(id)) return;
    removedIds.add(id);
    (childrenOf.get(id) ?? []).forEach(removeWithChildren);
  };
  rows.forEach((row) => {
    const rule = row.rule ?? '';
    const addon = addonNameOfRule(rule, tablePrefix, rootPrefix);
    if (!addon || keep.has(addon)) return;
    if (rule.startsWith(rootPrefix)) removedRoots.push(row);
    removeWithChildren(row.id ?? '');
  });
  return { removedIds, removedRoots };
};

/**
 * 移除插件菜单并重新计算左右边界，等价于后台的「修复树关系」。
 */
export const cleanAddonMenus = (rows: RowValues[], options: AddonRuleOptions = {}): MenuCleanResult => {
  const { removedIds, removedRoots } = collectAddonMenuIds(rows, options);
  const kept = rows.filter((row) => !removedIds.has(row.id ?? ''));
  const visited = rebuildNestedSet(kept);
  if (visited !== kept.length) throw new Error(`菜单树存在环形父子关系，有 ${kept.length - visited} 条菜单无法归位，请先在后台修复菜单树。`);
  return { rows: kept, removedIds, removedRoots, total: rows.length };
};

/**
 * 校验嵌套集树是否合法：左右边界成对唯一、每行 left < right、直接子级完全落在父级区间内。
 * 返回问题描述数组，空数组表示合法。
 */
export const validateNestedSet = (rows: RowValues[]) => {
  const problems: string[] = [];
  const byId = new Map(rows.map((row) => [row.id ?? '', row]));
  const lefts = new Set<string>();
  const rights = new Set<string>();
  rows.forEach((row) => {
    const left = Number(row.left);
    const right = Number(row.right);
    if (!Number.isInteger(left) || !Number.isInteger(right) || left >= right) problems.push(`菜单 ${row.id} 的左右边界非法（${row.left}, ${row.right}）`);
    if (lefts.has(row.left ?? '')) problems.push(`左边界 ${row.left} 重复`);
    if (rights.has(row.right ?? '')) problems.push(`右边界 ${row.right} 重复`);
    lefts.add(row.left ?? '');
    rights.add(row.right ?? '');
    const parent = row.parent_id ?? '';
    if (!parent) return;
    const parentRow = byId.get(parent);
    if (!parentRow) {
      problems.push(`菜单 ${row.id} 的父级 ${parent} 不存在`);
      return;
    }
    if (!(Number(parentRow.left) < left && right < Number(parentRow.right))) problems.push(`菜单 ${row.id} 未落在父级 ${parent} 的区间内`);
  });
  return problems;
};

/**
 * 清理站点绑定：根路径映射指向被移除插件的站点整行移除。
 * addonNamespace 为插件路由命名空间（aon），例如 /aon/cms。
 */
export const cleanAddonSites = (sites: RowValues[], addonNamespace: string, removedAddons: Set<string>) => {
  const kept: RowValues[] = [];
  const removedIds = new Set<string>();
  sites.forEach((row) => {
    const basePath = (row.base_path ?? '').replace(/^\/+/, '').split('/');
    const inNamespace = basePath[0] === addonNamespace;
    if (inNamespace && removedAddons.has(normalize(basePath[1] ?? ''))) {
      removedIds.add(row.id ?? '');
      return;
    }
    kept.push(row);
  });
  return { rows: kept, removedIds };
};

/** 过滤关联表中指向已移除记录的行 */
export const filterRowsByColumn = (rows: RowValues[], column: string, removed: Set<string>) => rows.filter((row) => !removed.has(row[column] ?? ''));
