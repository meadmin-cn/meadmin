import { randomUUID } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { hash, readLocal, type Plan } from './planner.js';

type RecordFile = { path: string; before: string | null; after: string; state: 'pending' | 'writing' | 'written' };
export type UpgradeRecord = { root: string; from: string; to: string; phase: string; files: RecordFile[]; manual: string[]; installation: string };
export function safePath(root: string, path: string): string {
  if (!path || path.includes('\\') || path.includes(':') || path.startsWith('/') || path.split('/').some((x) => x === '..' || x === '.' || !x || ['.git', 'node_modules', '.meadmin', '.workbuddy'].includes(x.toLowerCase()))) throw new Error('恢复清单路径无效');
  readLocal(root, path);
  return join(root, path);
}
function atomic(file: string, content: Buffer | string) {
  mkdirSync(dirname(file), { recursive: true });
  const temporary = file + '.meadmin-' + randomUUID();
  try {
    writeFileSync(temporary, content, { mode: 0o600 });
    renameSync(temporary, file);
  } finally {
    if (existsSync(temporary)) unlinkSync(temporary);
  }
}
export function saveRecord(directory: string, record: UpgradeRecord) {
  atomic(join(directory, 'record.json'), JSON.stringify(record, null, 2));
}
export function applyPlan(root: string, plan: Plan, from: string, to: string): string {
  for (const part of ['.meadmin', '.meadmin/updates']) {
    const location = join(root, part);
    if (existsSync(location) && (lstatSync(location).isSymbolicLink() || !lstatSync(location).isDirectory())) throw new Error('升级备份目录不安全');
  }
  for (const change of plan.changes) {
    const before = readLocal(root, change.path);
    if ((before ? hash(before) : null) !== change.previous) throw new Error(`预览后文件发生变化：${change.path}`);
  }
  const directory = join(root, '.meadmin/updates', randomUUID());
  mkdirSync(directory, { recursive: true });
  const record: UpgradeRecord = { root: resolve(root), from, to, phase: 'prepared', files: [], manual: plan.manual, installation: 'not-run' };
  for (const change of plan.changes) {
    const before = readLocal(root, change.path);
    if ((before ? hash(before) : null) !== change.previous) throw new Error(`备份时文件发生变化：${change.path}`);
    if (before) atomic(join(directory, 'original', change.path), before);
    atomic(join(directory, 'target', change.path), change.content);
    record.files.push({ path: change.path, before: change.previous, after: hash(change.content), state: 'pending' });
  }
  saveRecord(directory, record);
  try {
    for (const [index, change] of plan.changes.entries()) {
      const current = readLocal(root, change.path);
      if ((current ? hash(current) : null) !== change.previous) throw new Error(`写入前文件发生变化：${change.path}`);
      record.files[index].state = 'writing';
      saveRecord(directory, record);
      atomic(safePath(root, change.path), change.content);
      record.files[index].state = 'written';
      saveRecord(directory, record);
    }
    record.phase = 'files-complete';
    saveRecord(directory, record);
  } catch (error) {
    record.phase = 'failed';
    try {
      saveRecord(directory, record);
    } catch {
      /* 日志写入失败也必须尝试恢复。 */
    }
    try {
      rollback(root, directory);
    } catch (recovery) {
      throw new Error(`${String(error)}；恢复未完成：${String(recovery)}。备份：${directory}`, { cause: recovery });
    }
    throw error;
  }
  return directory;
}
export function rollback(root: string, directory: string): void {
  const rel = relative(resolve(root), resolve(directory)).replaceAll('\\', '/');
  if (!/^\.meadmin\/updates\/[a-f0-9-]{36}$/.test(rel)) throw new Error('备份路径不在项目升级目录');
  let currentDirectory = resolve(root);
  for (const part of rel.split('/')) {
    currentDirectory = join(currentDirectory, part);
    if (!existsSync(currentDirectory) || lstatSync(currentDirectory).isSymbolicLink() || !lstatSync(currentDirectory).isDirectory()) throw new Error('备份路径不安全');
  }
  readLocal(directory, 'record.json');
  const record = JSON.parse(readFileSync(join(directory, 'record.json'), 'utf8')) as UpgradeRecord;
  if (record.root !== resolve(root)) throw new Error('备份所属项目不匹配');
  if (record.installation !== 'not-run') console.warn('安装已执行：仅恢复内容未被再次修改的升级文件；锁文件、node_modules及生命周期脚本影响需人工恢复并重新安装依赖。');
  const candidates = record.files.filter((file) => file.state !== 'pending');
  for (const file of candidates) {
    safePath(root, file.path);
    const current = readLocal(root, file.path),
      currentHash = current ? hash(current) : null;
    if (currentHash !== file.after && currentHash !== file.before) throw new Error(`升级后文件已被修改，拒绝覆盖：${file.path}`);
    if (file.before) {
      const backup = readLocal(directory, 'original/' + file.path);
      if (!backup || hash(backup) !== file.before) throw new Error(`备份不完整：${file.path}`);
    }
  }
  for (const file of [...candidates].reverse()) {
    const destination = safePath(root, file.path);
    if (file.before) atomic(destination, readFileSync(join(directory, 'original', file.path)));
    else if (existsSync(destination)) unlinkSync(destination);
  }
  record.phase = 'rolled-back';
  saveRecord(directory, record);
}
