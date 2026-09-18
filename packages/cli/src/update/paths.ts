import { lstatSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { validRelativePath } from './rules.js';

export const historyPath = 'node_modules/.meadmin/updates';
export function assertTreePath(location: string): void {
  const chain: string[] = [];
  for (let current = resolve(location); ; current = dirname(current)) {
    chain.unshift(current);
    if (dirname(current) === current) break;
  }
  for (const current of chain) {
    const stat = lstatSync(current, { throwIfNoEntry: false });
    if (!stat) continue;
    if (stat.isSymbolicLink() || relative(current, realpathSync(current)) !== '') throw new Error(`拒绝操作符号链接或逃逸路径：${current}`);
    if (current !== resolve(location) && !stat.isDirectory()) throw new Error(`父路径不是目录：${current}`);
  }
}
export function checkedPath(root: string, path: string): string {
  if (!validRelativePath(path)) throw new Error(`文件路径无效：${path}`);
  const location = resolve(root, path);
  const rel = relative(resolve(root), location);
  if (isAbsolute(rel) || rel === '..' || rel.startsWith('../') || rel.startsWith('..\\')) throw new Error(`文件路径越界：${path}`);
  assertTreePath(location);
  return location;
}
export function assertUpdatePath(path: string): void {
  const normalized = path.toLowerCase();
  if (normalized === historyPath || normalized.startsWith(historyPath + '/') || historyPath.startsWith(normalized + '/')) throw new Error(`禁止升级历史目录递归自覆盖：${path}`);
}
export function pathsOverlap(left: string, right: string): boolean {
  left = left.toLowerCase();
  right = right.toLowerCase();
  return left === right || left.startsWith(right + '/') || right.startsWith(left + '/');
}
