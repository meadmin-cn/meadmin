import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { mergeConfig, mergeEntity, mergePackage } from './merge.js';
import { assertTreePath, assertUpdatePath, checkedPath, historyPath, pathsOverlap } from './paths.js';
import { mergeProjectConfig, type ConfigKind } from './project-config.js';
import { excluded, mappedPath, skipExisting, sourceMode, validateConfig, type RuleGroup, type SourcePolicy, type UpdateConfig, type UpdateRules } from './rules.js';
import { isIntegrationSource, mergeSource } from './source.js';
import { generateUpdateSql } from './sql.js';
import { versionParts } from './template.js';

export type Change = { path: string; action: 'create' | 'overwrite' | 'merge'; previous: string | null; content: Buffer; conflict: boolean };
export type Plan = { changes: Change[]; skipped: string[]; manual: string[]; sqlTables: ReturnType<typeof generateUpdateSql>['tables'] };
export const hash = (content: Buffer) => createHash('sha256').update(content).digest('hex');
export function readLocal(root: string, path: string): Buffer | undefined {
  const current = checkedPath(root, path);
  const stat = lstatSync(current, { throwIfNoEntry: false });
  if (!stat) return undefined;
  if (!stat.isFile()) throw new Error(`文件路径被目录占用：${path}`);
  return readFileSync(current);
}
function templateFiles(root: string, config: UpdateRules): Map<string, Buffer> {
  const files = new Map<string, Buffer>();
  const visit = (directory: string, prefix = '') => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const sourcePath = prefix + entry.name;
      if (entry.isSymbolicLink()) throw new Error(`模板含符号链接：${sourcePath}`);
      if (entry.isDirectory()) {
        // 不剪枝被排除的祖先，精确 false 可以重新包含其任意子文件。
        if (sourcePath.toLowerCase() === historyPath && !excluded(sourcePath, config.exclude)) throw new Error(`禁止升级历史目录递归自覆盖：${sourcePath}`);
        visit(checkedPath(root, sourcePath), sourcePath + '/');
      } else if (entry.isFile()) {
        if (excluded(sourcePath, config.exclude)) continue;
        assertUpdatePath(sourcePath);
        const path = mappedPath(sourcePath, config.templateMappings);
        checkedPath(root, path);
        assertUpdatePath(path);
        if (excluded(path, config.exclude)) continue;
        if ([...files.keys()].some((existing) => pathsOverlap(existing, path))) throw new Error(`模板映射路径冲突：${path}`);
        files.set(path, readFileSync(checkedPath(root, sourcePath)));
      } else throw new Error(`模板含不支持的文件类型：${sourcePath}`);
    }
  };
  assertTreePath(root);
  visit(root);
  return files;
}
export function makePlan(root: string, oldTemplate: string, targetTemplate: string, targetVersion: string, rules: RuleGroup<boolean>, sourceRules: RuleGroup<SourcePolicy> = {}, options?: UpdateConfig): Plan {
  const config = validateConfig({ skipExisting: rules, mergeSource: sourceRules, ...options });
  versionParts(targetVersion);
  for (const template of [oldTemplate, targetTemplate]) {
    if (pathsOverlap(resolve(root).replaceAll('\\', '/'), resolve(template).replaceAll('\\', '/'))) throw new Error('源模板与目标项目目录重叠，拒绝递归自覆盖');
  }
  assertTreePath(root);
  const base = templateFiles(oldTemplate, config),
    target = templateFiles(targetTemplate, config);
  const plan: Plan = { changes: [], skipped: [], manual: [], sqlTables: [] };
  const add = (path: string, content: Buffer, action: Change['action'], previous?: Buffer, conflict = false) => {
    assertUpdatePath(path);
    if (previous?.equals(content)) return;
    if (plan.changes.some((change) => pathsOverlap(change.path, path))) throw new Error(`规划产物路径冲突：${path}`);
    plan.changes.push({ path, action: previous ? action : 'create', previous: previous ? hash(previous) : null, content, conflict });
  };
  const policy = (path: string, content: Buffer): SourcePolicy => {
    const explicit = sourceMode(path, config.mergeSource);
    if (explicit !== undefined) return explicit;
    if (config.autoIntegration && /\.[cm]?[jt]s$/.test(path) && isIntegrationSource(content.toString('utf8'))) return 'exports';
    return config.defaultPolicy;
  };
  const processFile = (path: string, content: Buffer, old?: Buffer) => {
    if (excluded(path, config.exclude)) {
      plan.skipped.push(`${path}: 排除`);
      return;
    }
    assertUpdatePath(path);
    const local = readLocal(root, path);
    if (local && skipExisting(path, config.skipExisting)) {
      plan.skipped.push(`${path}: 存在时跳过`);
      return;
    }
    const mode = policy(path, content);
    if (mode === 'skip') {
      plan.skipped.push(`${path}: 完全跳过`);
      return;
    }
    if (local?.equals(content) && mode !== 'env') return;
    if (mode === 'manual') {
      plan.manual.push(`${path}: 按配置保留本地，需人工处理`);
      return;
    }
    const conflict = !!local && (!old || !old.equals(local));
    if (mode && ['env', 'yaml', 'json', 'npmrc', 'ignore', 'script'].includes(mode)) {
      const initial = mode === 'yaml' || mode === 'json' ? '{}\n' : '';
      const result = mergeProjectConfig(path, local?.toString('utf8') ?? initial, content.toString('utf8'), mode as ConfigKind);
      plan.manual.push(...result.manual.map((message) => `${path}: ${message}`));
      if (mode === 'env' && !local && !result.manual.length) add(path, content, 'create');
      else if (local || result.content !== initial) add(path, Buffer.from(result.content), 'merge', local, conflict);
      return;
    }
    if (!local || mode === false || mode === 'overwrite') {
      add(path, content, 'overwrite', local, conflict);
      return;
    }
    try {
      const merge = mode === 'package' ? mergePackage : mode === 'entity' ? mergeEntity : mode === 'config' ? mergeConfig : undefined;
      const result = merge ? merge(local.toString('utf8'), content.toString('utf8'), old?.toString('utf8')) : mergeSource(local.toString('utf8'), content.toString('utf8'), old?.toString('utf8'), mode as 'functions' | 'exports' | 'validation' | 'routes', path);
      plan.manual.push(...result.manual.map((message) => `${path}: ${message}`));
      add(path, Buffer.from(result.content), 'merge', local, conflict);
    } catch (error) {
      plan.manual.push(`${path}: 合并失败，需人工处理：${String(error)}`);
    }
  };
  const sql = config.sql;
  const outputs = [sql.originalName === false ? false : sql.originalName.replaceAll('{version}', targetVersion), sql.output].filter((path): path is string => path !== false);
  if (sql.enabled) {
    assertUpdatePath(sql.source);
    for (const [index, path] of outputs.entries()) {
      checkedPath(root, path);
      assertUpdatePath(path);
      if (pathsOverlap(path, sql.source) || outputs.slice(0, index).some((other) => pathsOverlap(other, path)) || [...target.keys()].some((other) => pathsOverlap(other, path))) throw new Error(`SQL 产物路径冲突：${path}`);
    }
  }
  for (const [path, content] of target) {
    if (sql.enabled && path.toLowerCase() === sql.source.toLowerCase()) continue;
    processFile(path, content, base.get(path));
  }
  for (const path of base.keys()) {
    if (!target.has(path) && sourceMode(path, config.mergeSource) !== 'skip' && config.defaultPolicy !== 'skip') plan.manual.push(`${path}: 目标模板已移除，本地不会删除`);
  }
  if (sql.enabled) {
    const source = [...target].find(([path]) => path.toLowerCase() === sql.source.toLowerCase());
    if (source) {
      const [sourcePath, content] = source;
      const mode = policy(sourcePath, content);
      const local = readLocal(root, sourcePath);
      if (mode === 'skip' || (local && skipExisting(sourcePath, config.skipExisting))) plan.skipped.push(`${sourcePath}: SQL 源按规则跳过`);
      else if (mode === 'manual') plan.manual.push(`${sourcePath}: SQL 源需人工处理`);
      else {
        if (sql.originalName !== false) processFile(sql.originalName.replaceAll('{version}', targetVersion), content);
        if (sql.output !== false) {
          const generated = generateUpdateSql(content.toString('utf8'), targetVersion);
          const before = plan.changes.length;
          processFile(sql.output, Buffer.from(generated.content));
          if (plan.changes.length > before) {
            plan.manual.push(...generated.manual.map((item) => 'SQL: ' + item));
            plan.sqlTables = generated.tables;
          }
        }
      }
    } else plan.manual.push(`目标模板缺少 ${sql.source}，未生成数据升级脚本`);
  }
  return plan;
}
