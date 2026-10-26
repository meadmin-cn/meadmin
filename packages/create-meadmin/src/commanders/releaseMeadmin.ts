//一键发布 meadmin：导出干净的数据库 SQL 并生成模板
import { QueryTypes } from '@sequelize/core';
import { Command } from 'commander';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { cleanAddonMenus, cleanAddonSites, collectAddonMenuIds, filterRowsByColumn, isAddonTable, parseAddonOfTable, validateNestedSet } from '../utils/addonClean.js';
import { loadDbConfig, type DbConfig } from '../utils/dbConfig.js';
import { recursionWriteFileSync } from '../utils/file.js';
import { createSequelize, dumpSchema, execute, listTables, queryRows, quoteIdent, type DumpResult, type RowValues } from '../utils/pgDump.js';
import { assertVersion, readVersion, setVersions } from '../utils/version.js';
import { generateTemplate } from './setMeadminTemplate.js';

/** 菜单表（树形结构，需要重算左右边界） */
const MENU_TABLE = 'system_menu';
/** 角色-菜单关联表 */
const ROLE_MENU_TABLE = 'role_menu';
/** 站点绑定表 */
const SITE_TABLE = 'system_site';
/** 伪静态规则表 */
const REWRITE_TABLE = 'system_rewrite';

type ReleaseOptions = {
  env?: string;
  mode?: string;
  releaseVersion?: string;
  schema?: string;
  out: string;
  tablePrefix: string;
  menuPrefix: string;
  keepAddon?: string[];
  skipBackup?: boolean;
  skipVerify?: boolean;
  skipTemplate?: boolean;
  onlyTemplate?: boolean;
  dryRun?: boolean;
  debug?: boolean;
};

const log = (message: string) => console.log(message);
const step = (index: number, message: string) => console.log(`\n[${index}] ${message}`);
const ok = (message: string) => console.log(`    √ ${message}`);
const warn = (message: string) => console.log(`    ! ${message}`);

/**
 * 询问本次发布版本号：直接回车保持当前版本，输入则校验 x.y.z。
 * 非交互环境（CI / 管道）不阻塞，保持当前版本并提示可用 --release-version 指定。
 */
async function askVersion(current: string, preset?: string): Promise<string> {
  if (preset) return assertVersion(preset);
  if (!process.stdin.isTTY) {
    warn(`非交互环境，版本号保持 ${current}；需要修改请加 --release-version <x.y.z>`);
    return current;
  }
  const { createInterface } = await import('node:readline/promises');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const answer = (await rl.question(`请输入本次发布版本号（当前 ${current}，直接回车保持不变）\n`)).trim();
      if (!answer) return current;
      try {
        return assertVersion(answer);
      } catch (error) {
        warn((error as Error).message);
      }
    }
    throw new Error('版本号输入多次无效，已中止');
  } finally {
    rl.close();
  }
}

/** 校验当前目录是不是 meadmin 项目根目录 */
const assertProjectRoot = (cwd: string) => {
  const pkgFile = resolve(cwd, 'package.json');
  if (!existsSync(pkgFile)) throw new Error(`未找到 package.json，请在 meadmin 项目根目录执行本命令。`);
  const pkg = JSON.parse(readFileSync(pkgFile, 'utf-8')) as { name?: string };
  const expected = ['view/admin/package.json', 'src/entities'];
  const missing = expected.filter((item) => !existsSync(resolve(cwd, item)));
  if (missing.length) throw new Error(`目录 ${cwd}（${pkg.name ?? '未命名'}）不像是 meadmin 项目根目录，缺少：${missing.join('、')}`);
};

const timestamp = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

/**
 * 把导出的 SQL 导入临时 schema，核对表结构与数据是否与导出结果一致。
 * 校验完成后无论成功失败都会删除临时 schema。
 */
const verifyDump = async (client: ReturnType<typeof createSequelize>, config: DbConfig, dump: DumpResult) => {
  const scratch = `${config.schema}_release_verify_${Date.now().toString(36)}`;
  const problems: string[] = [];
  await execute(client, `CREATE SCHEMA ${quoteIdent(scratch)}`);
  const verifier = createSequelize({ ...config, schema: scratch });
  try {
    await verifier.queryRaw(dump.sql, { raw: true, type: QueryTypes.RAW });
    for (const [table, expected] of Object.entries(dump.rowCounts)) {
      const [row] = await queryRows<{ count: string }>(verifier, `SELECT count(*)::text AS count FROM ${quoteIdent(table)}`);
      const actual = Number(row?.count ?? -1);
      if (actual !== expected) problems.push(`表 ${table} 导入后行数为 ${actual}，预期 ${expected}`);
    }
    const tables = await queryRows<{ name: string }>(verifier, `SELECT c.relname AS name FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = '${scratch}' AND c.relkind = 'r' ORDER BY c.relname`);
    if (tables.length !== Object.keys(dump.rowCounts).length) problems.push(`导入后表数量为 ${tables.length}，预期 ${Object.keys(dump.rowCounts).length}`);
    const names = tables.map((item) => item.name);
    if (names.includes(MENU_TABLE)) {
      const [{ count: danglingParent }] = await queryRows<{ count: string }>(verifier, `SELECT count(*)::text AS count FROM ${quoteIdent(MENU_TABLE)} child WHERE child.parent_id IS NOT NULL AND child.parent_id <> '' AND NOT EXISTS (SELECT 1 FROM ${quoteIdent(MENU_TABLE)} parent WHERE parent.id = child.parent_id)`);
      if (Number(danglingParent)) problems.push(`有 ${danglingParent} 条菜单的父级不存在`);
      const [{ count: badRange }] = await queryRows<{ count: string }>(verifier, `SELECT count(*)::text AS count FROM ${quoteIdent(MENU_TABLE)} WHERE "left" IS NULL OR "right" IS NULL OR "left" >= "right"`);
      if (Number(badRange)) problems.push(`有 ${badRange} 条菜单的左右边界非法`);
    }
    if (names.includes(ROLE_MENU_TABLE) && names.includes(MENU_TABLE)) {
      const [{ count: danglingMenu }] = await queryRows<{ count: string }>(verifier, `SELECT count(*)::text AS count FROM ${quoteIdent(ROLE_MENU_TABLE)} rm WHERE NOT EXISTS (SELECT 1 FROM ${quoteIdent(MENU_TABLE)} m WHERE m.id = rm.system_menu_id)`);
      if (Number(danglingMenu)) problems.push(`有 ${danglingMenu} 条角色菜单关联指向不存在的菜单`);
    }
    if (names.includes(REWRITE_TABLE) && names.includes(SITE_TABLE)) {
      const [{ count: danglingSite }] = await queryRows<{ count: string }>(verifier, `SELECT count(*)::text AS count FROM ${quoteIdent(REWRITE_TABLE)} rw WHERE NOT EXISTS (SELECT 1 FROM ${quoteIdent(SITE_TABLE)} s WHERE s.id = rw.site_id)`);
      if (Number(danglingSite)) problems.push(`有 ${danglingSite} 条伪静态规则指向不存在的站点`);
    }
  } finally {
    await verifier.close();
    await execute(client, `DROP SCHEMA IF EXISTS ${quoteIdent(scratch)} CASCADE`);
  }
  return problems;
};

/**
 * 导出前先在库里做一次轻量统计：需要移除的插件表、插件菜单、关联行。
 * 这里只做统计与判定，不修改线上库。
 */
const analyze = async (client: ReturnType<typeof createSequelize>, config: DbConfig, options: Required<Pick<ReleaseOptions, 'tablePrefix' | 'menuPrefix'>> & { keepAddon?: string[] }) => {
  const rules = { tablePrefix: options.tablePrefix, menuRootPrefix: options.menuPrefix, keepAddons: options.keepAddon ?? [] };
  const allTables = (await listTables(client, config.schema)).map((item) => item.name);
  const addonTables = allTables.filter((table) => isAddonTable(table, rules));
  const coreTables = allTables.filter((table) => !addonTables.includes(table));
  const removedAddons = new Set(addonTables.map((table) => parseAddonOfTable(table, rules.tablePrefix)));
  const menuRows = coreTables.includes(MENU_TABLE) ? await queryRows<RowValues>(client, `SELECT id, parent_id, rule, title FROM ${quoteIdent(MENU_TABLE)}`) : [];
  const menu = collectAddonMenuIds(menuRows, rules);
  const siteRows = coreTables.includes(SITE_TABLE) ? await queryRows<RowValues>(client, `SELECT id, name, base_path FROM ${quoteIdent(SITE_TABLE)}`) : [];
  const sites = cleanAddonSites(siteRows, options.tablePrefix.replace(/_$/, ''), removedAddons);
  return { rules, allTables, addonTables, coreTables, removedAddons, menuRows, menu, siteRows, sites };
};

/**
 * 生成干净 SQL：剔除插件表，剔除插件菜单并重算左右边界，清理指向插件的关联数据。
 * 同时返回实际写入的菜单行，供结构校验使用。
 */
const buildCleanDump = async (client: ReturnType<typeof createSequelize>, config: DbConfig, analysis: Awaited<ReturnType<typeof analyze>>) => {
  const { rules, coreTables, removedAddons, menu, sites } = analysis;
  const menuRemoved = menu.removedIds;
  const siteRemoved = sites.removedIds;
  const addonList = [...removedAddons].sort();
  const header = [`-- 已排除插件表: ${analysis.addonTables.length ? analysis.addonTables.join('、') : '无'}`, `-- 已排除插件菜单: ${menuRemoved.size} 条（${addonList.length ? addonList.map((item) => `addons_${item}`).join('、') : '无'}）`, `-- 菜单左右边界已按 parent_id 重新计算`, `-- 已移除模式名前缀，可直接导入任意 schema`];
  let cleanedMenuRows: RowValues[] = [];
  const dump = await dumpSchema(client, config, {
    tables: coreTables,
    headerLines: header,
    transformRows: (table, rows) => {
      if (table === MENU_TABLE) {
        const result = cleanAddonMenus(rows, rules);
        cleanedMenuRows = result.rows;
        return result.rows;
      }
      if (table === ROLE_MENU_TABLE) return filterRowsByColumn(rows, 'system_menu_id', menuRemoved);
      if (table === SITE_TABLE) return rows.filter((row) => !siteRemoved.has(row.id ?? ''));
      if (table === REWRITE_TABLE) return filterRowsByColumn(rows, 'site_id', siteRemoved);
      return rows;
    },
  });
  return { dump, menuRows: cleanedMenuRows };
};

export const releaseMeadmin = (program: Command) => {
  program
    .command('meadmin')
    .description('一键发布 meadmin：导出数据库（自动剔除插件表与插件菜单）→ 生成 meadmin.sql → 生成模板')
    .argument('[file]', '模板目录名', 'meadmin')
    .option('-m, --mode <env>', '按环境加载 .env + .env.<env>，如 -m local')
    .option('--env <file>', '数据库配置文件路径，优先于 -m；默认依次查找 .env.local、.env')
    .option('--release-version <x.y.z>', '发布版本号；不传则交互询问（回车保持当前版本）')
    .option('--schema <name>', '数据库模式名，默认取配置文件中的 DATABASE_SCHEMA')
    .option('--out <dir>', '备份与报告输出目录', '.workbuddy/release')
    .option('--table-prefix <prefix>', '插件表前缀', 'aon_')
    .option('--menu-prefix <prefix>', '插件根菜单的规则前缀', 'addons_')
    .option('--keep-addon <name...>', '保留指定插件的表与菜单数据（仅影响数据库导出，模板始终不含插件源码）')
    .option('--skip-backup', '不生成完整备份 SQL')
    .option('--skip-verify', '跳过导出结果的导入校验')
    .option('--skip-template', '只生成 meadmin.sql，不生成模板')
    .option('--only-template', '跳过数据库导出，直接用现有 meadmin.sql 生成模板')
    .option('--dry-run', '只导出并校验，不写文件、不生成模板')
    .option('--debug', '打印执行的 SQL')
    .action(async (file: string, options: ReleaseOptions) => {
      const cwd = process.cwd();
      let index = 0;
      try {
        assertProjectRoot(cwd);
        log(`项目目录: ${cwd}`);
        log(`模板名称: ${file}`);

        // 第一步就定版本：四个包 + 仓库根一起改，避免发完才发现 update 只认 x.y.z
        step(++index, '设置版本号');
        const currentVersion = readVersion(cwd);
        const releaseVersion = await askVersion(currentVersion, options.releaseVersion);
        if (releaseVersion === currentVersion) {
          ok(`保持 ${currentVersion}`);
        } else if (options.dryRun) {
          warn(`dry-run：将把 ${currentVersion} 改为 ${releaseVersion}，本次不写文件`);
        } else {
          const changes = setVersions(cwd, releaseVersion);
          changes.forEach((change) => ok(`${change.name}: ${change.from} → ${releaseVersion}`));
          if (!changes.length) ok(`全部包已是 ${releaseVersion}`);
        }

        if (!options.onlyTemplate) {
          step(++index, '读取数据库配置');
          const config = loadDbConfig(cwd, options.env, options.schema, options.mode);
          ok(`配置文件 ${basename(config.envFile)}`);
          ok(`连接 ${config.host}:${config.port}/${config.database}，模式 ${config.schema}`);
          const client = createSequelize(config, Boolean(options.debug));
          try {
            step(++index, '分析插件表与插件菜单（只读，不修改数据库）');
            const analysis = await analyze(client, config, { tablePrefix: options.tablePrefix, menuPrefix: options.menuPrefix, keepAddon: options.keepAddon });
            ok(`共 ${analysis.allTables.length} 张表，其中插件表 ${analysis.addonTables.length} 张（${[...analysis.removedAddons].sort().join('、') || '无'}）`);
            ok(`共 ${analysis.menuRows.length} 条菜单，其中插件菜单 ${analysis.menu.removedIds.size} 条（${analysis.menu.removedRoots.map((row) => row.title ?? row.rule).join('、') || '无'}）`);
            if (analysis.sites.removedIds.size)
              ok(
                `移除 ${analysis.sites.removedIds.size} 个指向插件的站点绑定（${analysis.siteRows
                  .filter((row) => analysis.sites.removedIds.has(row.id ?? ''))
                  .map((row) => row.name)
                  .join('、')}）`,
              );

            step(++index, '生成干净的 meadmin.sql');
            const { dump: clean, menuRows: cleanedMenuRows } = await buildCleanDump(client, config, analysis);
            const menuAfter = analysis.menuRows.length - analysis.menu.removedIds.size;
            ok(`表 ${analysis.coreTables.length} 张，菜单 ${menuAfter} 条，SQL 大小 ${(clean.sql.length / 1024).toFixed(1)} KB`);
            clean.notes.forEach((note) => warn(note));

            step(++index, '校验菜单树结构');
            const menuProblems = validateNestedSet(cleanedMenuRows);
            if (menuProblems.length) throw new Error(`菜单树校验未通过：\n- ${menuProblems.slice(0, 10).join('\n- ')}`);
            ok('左右边界成对唯一、子级均落在父级区间内');

            let backup: DumpResult | null = null;
            if (!options.skipBackup) {
              step(++index, '生成完整备份（包含插件表，用于回溯）');
              backup = await dumpSchema(client, config, { tables: analysis.allTables, headerLines: [`-- 完整备份：包含全部插件表，仅用于回溯，不要作为模板数据使用`] });
              ok(`${analysis.allTables.length} 张表，大小 ${(backup.sql.length / 1024).toFixed(1)} KB`);
            }

            if (!options.skipVerify) {
              step(++index, '导入临时 schema 校验导出结果');
              const problems = await verifyDump(client, config, clean);
              if (problems.length) throw new Error(`导出结果校验未通过：\n- ${problems.slice(0, 10).join('\n- ')}`);
              ok(`${analysis.coreTables.length} 张表结构、行数与菜单树全部一致，临时 schema 已清理`);
            } else {
              warn('已跳过导入校验');
            }

            if (options.dryRun) {
              log('\n--- dry-run：以下内容不会写入文件 ---');
              log(clean.sql.split('\n').slice(0, 40).join('\n'));
              log(`...（共 ${clean.sql.split('\n').length} 行）`);
              return;
            }

            step(++index, '写入文件');
            const outDir = resolve(cwd, options.out);
            const stamp = timestamp();
            if (backup) {
              const backupFile = resolve(outDir, `backup-${stamp}.sql`);
              recursionWriteFileSync(backupFile, backup.sql);
              ok(`完整备份 ${options.out}/${basename(backupFile)}`);
            }
            const sqlFile = resolve(cwd, 'meadmin.sql');
            if (existsSync(sqlFile)) {
              const previous = resolve(outDir, `meadmin-${stamp}.prev.sql`);
              mkdirSync(outDir, { recursive: true });
              copyFileSync(sqlFile, previous);
              ok(`旧 meadmin.sql 已备份到 ${options.out}/${basename(previous)}`);
            }
            recursionWriteFileSync(sqlFile, clean.sql);
            ok(`已写入 meadmin.sql（${(clean.sql.length / 1024).toFixed(1)} KB）`);
          } finally {
            await client.close();
          }
        } else {
          warn('已跳过数据库导出，直接使用现有 meadmin.sql');
          if (!existsSync(resolve(cwd, 'meadmin.sql'))) throw new Error('当前目录没有 meadmin.sql，无法生成模板。');
        }

        if (options.dryRun) return;
        if (options.skipTemplate) {
          log('\n已跳过模板生成（--skip-template）。');
          return;
        }
        step(++index, `生成模板 ${file}`);
        await generateTemplate(file, cwd);
        ok(`模板已生成到 packages/create-meadmin/template/${file}`);
        log(`\n发布产物已就绪：\n- SQL: ${resolve(cwd, 'meadmin.sql')}\n- 模板: ${resolve(process.cwd(), 'packages/create-meadmin/template', file)}\n下一步：pnpm -F create-meadminjs build 后发布 npm 包。`);
      } catch (error) {
        console.error(`\n执行失败：${(error as Error).message}`);
        process.exitCode = 1;
      }
    });
};
