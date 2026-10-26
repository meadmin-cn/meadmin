import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { mergeConfig, mergeEntity, mergePackage } from './merge.js';
import { assertTreePath, assertUpdatePath, checkedPath, historyPath, pathsOverlap } from './paths.js';
import { mergeProjectConfig, type ConfigKind } from './project-config.js';
import { excluded, mappedPath, skipExisting, sourceMode, validateConfig, type RuleGroup, type SourcePolicy, type UpdateConfig, type UpdateRules } from './rules.js';
import { hasLocalOnlyCode, isIntegrationSource, mergeSource } from './source.js';
import { generateUpdateSql } from './sql.js';
import { contentHash, isPristine, readTemplateState } from './state.js';
import { versionParts } from './template.js';

export type Change = { path: string; action: 'create' | 'overwrite' | 'merge'; previous: string | null; content: Buffer; conflict: boolean };
/** 本地内容已经等于新模板的文件：写盘后要记进模板来源清单，下次升级才能识别「用户没改过」 */
export type Pristine = { path: string; hash: string };
export type Plan = { changes: Change[]; pristine: Pristine[]; skipped: string[]; manual: string[]; aligned: string[]; sqlTables: ReturnType<typeof generateUpdateSql>['tables']; /** 本次是否产出了 update.sql（与内容有无变化无关） */ sqlGenerated: boolean };
export const hash = (content: Buffer) => createHash('sha256').update(content).digest('hex');
export function readLocal(root: string, path: string): Buffer | undefined {
  const current = checkedPath(root, path);
  const stat = lstatSync(current, { throwIfNoEntry: false });
  if (!stat) return undefined;
  if (!stat.isFile()) throw new Error(`文件路径被目录占用：${path}`);
  return readFileSync(current);
}
/**
 * 找出目标模板里有、本地文件里完全没有的顶层导出名。
 * 只判断「整体缺失」：本地存在同名标识符就不算，避免误判用户改写过的文件。
 */
function missingExport(localText: string, targetText: string) {
  const pattern = /^\s*export\s+(?:default\s+)?(?:async\s+)?(?:declare\s+)?(?:const|let|var|function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm;
  const names = new Set<string>();
  for (const match of targetText.matchAll(pattern)) names.add(match[1]);
  for (const name of names) {
    if (!new RegExp(`(^|[^\\w$])${name}([^\\w$]|$)`).test(localText)) return name;
  }
  return undefined;
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
  const plan: Plan = { changes: [], pristine: [], skipped: [], manual: [], aligned: [], sqlTables: [], sqlGenerated: false };
  // 模板来源清单：本地内容命中它，说明这文件是上一轮升级原样交付的、用户没改过
  const state = readTemplateState(root);
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
    // 缺失文件没有本地内容可合并：除显式排除/跳过外，按模板原始字节创建。
    // 合并器和 manual 策略仅用于已有文件，不以内容是否可解析限制新增。
    if (!local) {
      add(path, content, 'create');
      return;
    }
    if (local.equals(content) && mode !== 'env') {
      // 内容已经是新版：记进清单，下次升级才能判定它「用户没改过」
      plan.pristine.push({ path, hash: contentHash(content) });
      return;
    }
    // 三方合并的快速路径：本地文件与上一版模板逐字节一致、或命中上一轮的交付清单，说明用户从未动过它，
    // 直接采用新模板即可。否则 functions/exports/routes 这些增量合并「只增不减」——新函数被追加到文件末尾、
    // 旧实现原样留着，升级完看起来文件变了、跑的仍是旧逻辑（router/index.ts、entry-server.ts、utils/helper.ts 都踩过）。
    // 清单这一路是必需的：一旦某个文件被旧版 update 漏更新过，它就永远不等于上一版模板，
    // 只比「本地 == 上一版模板」会把它一直当成用户改动，旧的实现再也升不上来。
    if ((old && old.equals(local)) || isPristine(state, path, local)) {
      add(path, content, 'overwrite', local, false);
      return;
    }
    if (mode === 'manual') {
      plan.manual.push(`${path}: 按配置保留本地，需人工处理`);
      return;
    }
    const conflict = !!local && (!old || !old.equals(local));
    // 合并器自己会带上 `路径: ` 前缀，这里避免重复拼一次
    const note = (message: string) => (message.startsWith(`${path}:`) ? message : `${path}: ${message}`);
    if (mode && ['env', 'yaml', 'json', 'npmrc', 'ignore', 'script'].includes(mode)) {
      const result = mergeProjectConfig(path, local.toString('utf8'), content.toString('utf8'), mode as ConfigKind);
      plan.manual.push(...result.manual.map(note));
      add(path, Buffer.from(result.content), 'merge', local, conflict);
      return;
    }
    if (mode === false || mode === 'overwrite') {
      add(path, content, 'overwrite', local, conflict);
      return;
    }
    try {
      const merge = mode === 'package' ? mergePackage : mode === 'entity' ? mergeEntity : mode === 'config' ? mergeConfig : undefined;
      const result = merge ? merge(local.toString('utf8'), content.toString('utf8'), old?.toString('utf8')) : mergeSource(local.toString('utf8'), content.toString('utf8'), old?.toString('utf8'), mode as 'functions' | 'exports' | 'validation' | 'routes', path);
      // 增量合并只做「结构可识别」的补齐，识别不了就等于什么都没做。这时如果模板还提供了本地完全没有的导出，
      // 说明本地停在了旧版本（典型症状：新 entry-server 引用了 router 里还不存在的导出，线上直接 500）。
      // 这种「只少不多」的情况按模板覆盖，原文件仍在升级备份里，可用 update --rollback 恢复。
      const changed = 'changed' in result ? result.changed : true;
      const staleExport = !changed && old?.equals(content) ? missingExport(local.toString('utf8'), content.toString('utf8')) : undefined;
      if (staleExport) {
        plan.aligned.push(`${path}: 本地缺少模板导出 ${staleExport}，已按模板覆盖（原文件在升级备份中，可用 update --rollback 恢复）`);
        add(path, content, 'overwrite', local, conflict);
        return;
      }
      // 增量合并只补不改：本地是目标的子集（每条语句、每个导入都能在模板里找到同样的原文）时，
      // 合并在导入写法、注释位置上仍会留残差，文件看起来"变了"其实只是没对齐。这时整体取模板字节是无损的。
      // 只对源码合并模式生效：package/entity/config 的合并结果含有用户数据，不能拿模板字节替换。
      const sourceMode = mode === 'functions' || mode === 'exports' || mode === 'validation' || mode === 'routes';
      if (sourceMode && result.content !== content.toString('utf8') && !hasLocalOnlyCode(local.toString('utf8'), content.toString('utf8'))) {
        plan.aligned.push(`${path}: 本地没有模板之外的内容，已整体对齐模板（原文件在升级备份中，可用 update --rollback 恢复）`);
        add(path, content, 'overwrite', local, conflict);
        return;
      }
      plan.manual.push(...result.manual.map(note));
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
          // 内容与已有文件一致时不会产生变更，但脚本本身是有效的：数据漂移（少行/错行）时
          // 重跑一遍幂等 INSERT 正是补救手段，所以要按「已生成」而不是「有变更」来判定
          plan.sqlGenerated = true;
        }
      }
    } else plan.manual.push(`目标模板缺少 ${sql.source}，未生成数据升级脚本`);
  }
  return plan;
}
