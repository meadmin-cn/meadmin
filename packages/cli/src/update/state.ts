import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { validRelativePath } from './rules.js';

/**
 * 模板来源清单。
 *
 * 升级是「差异式」的：拿上一版模板当基线，逐文件判断该覆盖还是该合并。判断「用户改没改过」原本只有
 * 一个依据 —— 本地文件与上一版模板逐字节比对。这个依据在有文件漏更新时就会失效：漏更新的文件永远
 * 不等于上一版模板，于是每次都被当成「用户改过」走增量合并，合并又只增不减，旧实现就一直留着。
 *
 * 所以额外记一份清单：上一轮升级由模板交付的每个文件的哈希。本地内容命中清单 ⇒ 用户没动过，
 * 直接按新模板覆盖即可，不必再依赖「本地 == 上一版模板」这种易被污染的判断。
 */
export type TemplateState = { version: string; files: Record<string, string> };
export const statePath = 'node_modules/.meadmin/template-state.json';
export const contentHash = (content: Buffer) => createHash('sha256').update(content).digest('hex');
const empty = (): TemplateState => ({ version: '', files: {} });

export function readTemplateState(root: string): TemplateState {
  const file = join(root, statePath);
  if (!existsSync(file)) return empty();
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as Partial<TemplateState>;
    const files: Record<string, string> = {};
    for (const [path, value] of Object.entries(parsed.files ?? {})) {
      // 清单来自磁盘，逐条校验路径与哈希形态，避免被篡改成越界路径
      if (typeof value !== 'string' || !/^[0-9a-f]{64}$/.test(value) || !validRelativePath(path)) continue;
      files[path] = value;
    }
    return { version: typeof parsed.version === 'string' ? parsed.version : '', files };
  } catch {
    // 清单损坏只影响「是否原样」的判断，退回旧逻辑即可，不能中断升级
    return empty();
  }
}

/** 本地内容与上一轮模板交付的字节完全一致 ⇒ 用户没改过 */
export function isPristine(state: TemplateState, path: string, content: Buffer): boolean {
  return state.files[path] === contentHash(content);
}

export function saveTemplateState(root: string, state: TemplateState): void {
  const file = join(root, statePath);
  mkdirSync(dirname(file), { recursive: true });
  const temporary = `${file}.meadmin-${process.pid}`;
  try {
    writeFileSync(temporary, JSON.stringify(state, null, 2), { mode: 0o600 });
    renameSync(temporary, file);
  } finally {
    if (existsSync(temporary)) unlinkSync(temporary);
  }
}
