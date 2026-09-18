import { randomUUID } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { stdin, stdout } from 'node:process';
import { assertTreePath, assertUpdatePath, pathsOverlap } from './paths.js';
import { hash, readLocal, type Plan } from './planner.js';
import { versionParts } from './template.js';

/** 新批次包含源/目标版本；兼容原有纯 UUID 目录。 */
export const validBackupId = (id: string): boolean => id === id.trim() && /^(?:v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)_to_v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)_)?[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id);

type ClearHistoryInteraction = {
  confirm: (message: string) => Promise<boolean>;
  isTTY?: boolean;
  log?: (message: string) => void;
};

// 从文件系统根开始逐层检查，包括项目根的父链；lstat 也能识别悬空链接和 Windows junction。
function historyDirectory(root: string): string | undefined {
  const directory = resolve(root, 'node_modules/.meadmin/updates');
  const chain: string[] = [];
  for (let current = directory; ; current = dirname(current)) {
    chain.unshift(current);
    if (dirname(current) === current) break;
  }
  for (const location of chain) {
    const stat = lstatSync(location, { throwIfNoEntry: false });
    if (!stat) return undefined;
    if (stat.isSymbolicLink() || !stat.isDirectory() || relative(location, realpathSync(location)) !== '') throw new Error(`升级历史目录不安全：${location}`);
  }
  return directory;
}

function historyTree(directory: string): string {
  const snapshot: unknown[] = [];
  const visit = (location: string) => {
    const stat = lstatSync(location);
    if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile()) || relative(location, realpathSync(location)) !== '') throw new Error(`备份包含不安全路径或符号链接，拒绝整个清理操作：${location}`);
    snapshot.push([location, stat.dev, stat.ino, stat.mode, stat.size, stat.mtimeMs, stat.ctimeMs]);
    if (stat.isDirectory()) for (const name of readdirSync(location).sort()) visit(join(location, name));
  };
  visit(directory);
  return JSON.stringify(snapshot);
}

function clearHistoryPreflight(root: string, id: string) {
  if (id !== 'all' && !validBackupId(id)) throw new Error('备份ID无效');
  const directory = historyDirectory(root);
  if (!directory) {
    if (id !== 'all') throw new Error(`备份批次不存在：${id}`);
    return [];
  }
  const names = id === 'all' ? readdirSync(directory).filter(validBackupId).sort() : [id];
  const entries: { id: string; directory: string; snapshot: string }[] = [];
  for (const name of names) {
    const location = join(directory, name);
    const stat = lstatSync(location, { throwIfNoEntry: false });
    if (!stat) throw new Error(`备份批次不存在：${name}`);
    if (stat.isSymbolicLink()) throw new Error(`备份批次为符号链接，拒绝整个清理操作：${location}`);
    if (!stat.isDirectory()) {
      if (id === 'all') continue;
      throw new Error(`备份批次不是目录：${location}`);
    }
    entries.push({ id: name, directory: location, snapshot: historyTree(location) });
  }
  return entries;
}

function historyVersion(directory: string, id: string): string {
  const versions = /^v(\d+\.\d+\.\d+)_to_v(\d+\.\d+\.\d+)_/.exec(id);
  const fallback = versions ? `${versions[1]} → ${versions[2]}（目录名）` : '未知（旧 UUID 批次）';
  try {
    const record: unknown = JSON.parse(readFileSync(join(directory, 'record.json'), 'utf8'));
    if (
      record &&
      typeof record === 'object' &&
      'from' in record &&
      'to' in record &&
      typeof record.from === 'string' &&
      typeof record.to === 'string' &&
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(record.from) &&
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(record.to) &&
      'root' in record &&
      typeof record.root === 'string' &&
      'phase' in record &&
      typeof record.phase === 'string' &&
      'installation' in record &&
      typeof record.installation === 'string' &&
      'files' in record &&
      Array.isArray(record.files) &&
      'manual' in record &&
      Array.isArray(record.manual)
    ) {
      return `${record.from} → ${record.to}`;
    }
  } catch {
    /* 损坏记录仍可按有效批次目录名清理，不信任记录中的任何路径。 */
  }
  return `${fallback}；记录缺失或损坏`;
}

/** 仅清理当前项目的精确备份批次；交互依赖可注入，以便在隔离 fixture 中验证真实删除。 */
export async function clearHistory(root: string, id: string, interaction: ClearHistoryInteraction): Promise<number> {
  root = resolve(root);
  const entries = clearHistoryPreflight(root, id);
  const log = interaction.log ?? console.log;
  for (const entry of entries) log(`\n完整路径：${entry.directory}\n版本：${historyVersion(entry.directory, entry.id)}`);
  if (entries.length) log(`将永久删除以上 ${entries.length} 个备份批次；删除后不可 rollback（无法回滚），请先另行保存重要备份。`);
  if (!(interaction.isTTY ?? (stdin.isTTY && stdout.isTTY))) throw new Error('清理历史需要交互式终端确认；非 TTY 拒绝删除，请在终端单独执行 --clear-history');
  if (!entries.length) {
    log('暂无可清理的升级历史备份');
    return 0;
  }
  if (!(await interaction.confirm('确认永久删除以上备份？删除后不可 rollback，默认取消。'))) {
    log('已取消清理，未删除任何备份');
    return 0;
  }
  // 确认期间可能发生变更：删除任何一个批次之前，重新检查全部父链、批次及子项。
  const checked = clearHistoryPreflight(root, id);
  if (JSON.stringify(checked) !== JSON.stringify(entries)) throw new Error('确认期间备份发生变化，未删除任何备份，请重新执行');
  for (const entry of checked) rmSync(entry.directory, { recursive: true });
  log(`已清理 ${checked.length} 个备份批次；对应批次已不可 rollback`);
  return checked.length;
}

type RecordFile = { path: string; before: string | null; after: string; state: 'pending' | 'writing' | 'written' };
export type UpgradeRecord = { root: string; from: string; to: string; phase: string; files: RecordFile[]; manual: string[]; installation: string };
export function safePath(root: string, path: string): string {
  assertUpdatePath(path);
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
  assertTreePath(root);
  for (const [index, change] of plan.changes.entries()) {
    safePath(root, change.path);
    if (plan.changes.slice(0, index).some((other) => pathsOverlap(other.path, change.path))) throw new Error(`规划产物路径冲突：${change.path}`);
  }
  for (const part of ['node_modules', 'node_modules/.meadmin', 'node_modules/.meadmin/updates']) {
    const location = join(root, part);
    if (existsSync(location) && (lstatSync(location).isSymbolicLink() || !lstatSync(location).isDirectory())) throw new Error('升级备份目录不安全');
  }
  for (const change of plan.changes) {
    const before = readLocal(root, change.path);
    if ((before ? hash(before) : null) !== change.previous) throw new Error(`预览后文件发生变化：${change.path}`);
  }
  versionParts(from);
  versionParts(to);
  const directory = join(root, 'node_modules/.meadmin/updates', `v${from}_to_v${to}_${randomUUID()}`);
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
  assertTreePath(root);
  assertTreePath(directory);
  const rel = relative(resolve(root), resolve(directory)).replaceAll('\\', '/');
  const segments = rel.split('/');
  if (segments.length !== 4 || segments.slice(0, 3).join('/') !== 'node_modules/.meadmin/updates' || !validBackupId(segments[3])) throw new Error('备份路径不在项目升级目录');
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
