import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { mergeConfig, mergeEntity, mergePackage } from './merge.js';
import { mergeProjectConfig, projectConfigKind } from './project-config.js';
import { excluded, skipExisting, sourceMode, type SourcePolicy } from './rules.js';
import { isIntegrationSource, mergeSource } from './source.js';
import { generateUpdateSql } from './sql.js';

export type Change = { path: string; action: 'create' | 'overwrite' | 'merge'; previous: string | null; content: Buffer; conflict: boolean };
export type Plan = { changes: Change[]; skipped: string[]; manual: string[]; sqlTables: ReturnType<typeof generateUpdateSql>['tables'] };
export const hash = (content: Buffer) => createHash('sha256').update(content).digest('hex');
export function readLocal(root: string, path: string): Buffer | undefined {
  let current = root;
  for (const part of path.split('/')) {
    current = join(current, part);
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) throw new Error(`拒绝操作符号链接：${path}`);
  }
  if (!existsSync(current)) return undefined;
  if (!lstatSync(current).isFile()) throw new Error(`文件路径被目录占用：${path}`);
  return readFileSync(current);
}
function templateFiles(root: string): Map<string, Buffer> {
  const files = new Map<string, Buffer>(),
    names = new Set<string>();
  const visit = (directory: string, prefix = '') => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const sourcePath = prefix + entry.name;
      if (excluded(sourcePath)) continue;
      if (entry.isSymbolicLink()) throw new Error(`模板含符号链接：${sourcePath}`);
      if (entry.isDirectory()) visit(join(directory, entry.name), sourcePath + '/');
      else if (entry.isFile()) {
        const path = prefix + (entry.name === 'packageTemplate.json' ? 'package.json' : entry.name);
        if (names.has(path.toLowerCase())) throw new Error(`模板映射路径冲突：${path}`);
        names.add(path.toLowerCase());
        files.set(path, readFileSync(join(directory, entry.name)));
      }
    }
  };
  visit(root);
  return files;
}
export function makePlan(root: string, oldTemplate: string, targetTemplate: string, targetVersion: string, rules: Record<string, boolean>, sourceRules: Record<string, SourcePolicy> = {}): Plan {
  const base = templateFiles(oldTemplate),
    target = templateFiles(targetTemplate);
  const plan: Plan = { changes: [], skipped: [], manual: [], sqlTables: [] };
  const add = (path: string, content: Buffer, action: Change['action'], previous?: Buffer, conflict = false) => {
    if (previous?.equals(content)) return;
    plan.changes.push({ path, action: previous ? action : 'create', previous: previous ? hash(previous) : null, content, conflict });
  };
  for (const [path, content] of target) {
    if (path.toLowerCase() === 'meadmin.sql') continue;
    if (path.toLowerCase() === 'update.sql' || /^meadmin-.*\.sql$/i.test(path)) {
      plan.manual.push(`${path}: 模板含升级产物保留名称，未复制`);
      continue;
    }
    const local = readLocal(root, path),
      old = base.get(path);
    if (local && skipExisting(path, rules)) {
      plan.skipped.push(`${path}: 存在时跳过`);
      continue;
    }
    const explicitMode = sourceMode(path, sourceRules);
    // 只比较本地与目标内容；旧模板用于冲突提示，不用于跳过普通文件。
    if (local?.equals(content) && projectConfigKind(path) !== 'env') continue;
    if (projectConfigKind(path)) {
      const kind = projectConfigKind(path);
      const initial = kind === 'yaml' || kind === 'json' ? '{}\n' : '';
      const result = mergeProjectConfig(path, local?.toString('utf8') ?? initial, content.toString('utf8'));
      plan.manual.push(...result.manual.map(message => `${path}: ${message}`));
      if (kind === 'env' && !local && !result.manual.length) add(path, content, 'create');
      else if (local || result.content !== initial) add(path, Buffer.from(result.content), 'merge', local, !!local && (!old || !old.equals(local)));
      continue;
    }
    if (!local) {
      add(path, content, 'create');
      continue;
    }
    const conflict = !old || !old.equals(local);
    const sourceFile = /\.[cm]?[jt]s$/.test(path);
    const builtinMerge = path === 'package.json' || path.endsWith('/package.json') || /(^|\/)entities\//.test(path) || /(^|\/)src\/config\//.test(path);
    // 显式 false 关闭自动识别；默认不扩大到有运行时初始化逻辑的入口。
    const mode = sourceFile && (!builtinMerge || explicitMode === 'routes') ? (explicitMode === undefined && isIntegrationSource(content.toString('utf8')) ? 'exports' : explicitMode) : undefined;
    if (mode === 'overwrite') {
      add(path, content, 'overwrite', local, conflict);
      continue;
    }
    if (mode) {
      const result = mergeSource(local.toString('utf8'), content.toString('utf8'), old?.toString('utf8'), mode, path);
      plan.manual.push(...result.manual.map((message) => `${path}: ${message}`));
      add(path, Buffer.from(result.content), 'merge', local, conflict);
      continue;
    }
    const merge = path.endsWith('/package.json') || path === 'package.json' ? mergePackage : /(^|\/)entities\/.*\.ts$/.test(path) ? mergeEntity : /(^|\/)src\/config\//.test(path) && path.endsWith('.ts') ? mergeConfig : undefined;
    if (merge) {
      try {
        const result = merge(local.toString('utf8'), content.toString('utf8'), old?.toString('utf8'));
        plan.manual.push(...result.manual.map((message) => `${path}: ${message}`));
        add(path, Buffer.from(result.content), 'merge', local, conflict);
      } catch (error) {
        plan.manual.push(`${path}: 合并失败，需人工处理：${String(error)}`);
      }
    } else add(path, content, 'overwrite', local, conflict);
  }
  for (const path of base.keys()) if (!target.has(path) && !excluded(path)) plan.manual.push(`${path}: 目标模板已移除，本地不会删除`);
  const sql = [...target].find(([path]) => path.toLowerCase() === 'meadmin.sql')?.[1];
  if (sql) {
    const generated = generateUpdateSql(sql.toString('utf8'), targetVersion);
    const originalName = `meadmin-${targetVersion}.sql`;
    add(originalName, sql, 'overwrite', readLocal(root, originalName));
    add('update.sql', Buffer.from(generated.content), 'overwrite', readLocal(root, 'update.sql'));
    plan.manual.push(...generated.manual.map((item) => 'SQL: ' + item));
    plan.sqlTables = generated.tables;
  } else plan.manual.push('目标模板缺少 meadmin.sql，未生成数据升级脚本');
  return plan;
}
