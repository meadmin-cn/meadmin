import type { Command } from 'commander';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { applyPlan, clearHistory, rollback, saveRecord, validBackupId, type UpgradeRecord } from '../update/backup.js';
import { makePlan } from '../update/planner.js';
import { validateConfig } from '../update/rules.js';
import { currentVersion, downloadTemplate, registryManifest, selectVersion } from '../update/template.js';
import { Log } from '../utils/log.js';

async function confirm(message: string): Promise<boolean> {
  if (!stdin.isTTY || !stdout.isTTY) throw new Error('需要交互式终端确认；非交互场景请使用 --dry-run');
  const prompt = createInterface({ input: stdin, output: stdout });
  try {
    return (await prompt.question(message + ' [y/N] ')).trim().toLowerCase() === 'y';
  } finally {
    prompt.close();
  }
}
export const databaseReminder = `
后续必须手动处理：
1. 文件升级会将模板新增依赖写入清单；升级后请核对人工合并项，手动执行 pnpm install（如尚未安装），再更新后端编译产物。
2. 备份数据库后手动执行：pnpm exec meadmin sync * 同步数据库表结构。
3. 谨慎执行 update.sql！建议自行比较版本SQL、update.sql与现有数据库后再执行，先在测试环境验证。
4. 数据处理完成后，手动依次执行菜单、组织、角色的“修复树关系”。
5. 刷新/重新登录并核对菜单授权、组织数据范围和业务功能。
本工具不自动同步表结构、执行SQL或修复树关系。原始版本SQL不能直接完整导入已有业务库。
文件回滚不回滚数据库。新增授权关联也可能影响已有角色权限。
升级历史和备份存放在 node_modules/.meadmin；清理 node_modules 前请另行备份，否则无法回滚。
`;
function readHistory(root: string) {
  const directory = join(root, 'node_modules/.meadmin/updates');
  for (const part of ['node_modules', 'node_modules/.meadmin', 'node_modules/.meadmin/updates']) {
    const location = join(root, part);
    if (!existsSync(location)) return { directory, entries: [] };
    if (lstatSync(location).isSymbolicLink() || !lstatSync(location).isDirectory()) throw new Error('升级历史目录不安全');
  }
  const entries = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && validBackupId(entry.name))
    .map((entry) => {
      const file = join(directory, entry.name, 'record.json');
      let from = '未知',
        to = '未知',
        phase = '记录缺失或损坏',
        installation = '未知';
      try {
        if (existsSync(file) && !lstatSync(file).isSymbolicLink()) {
          const record = JSON.parse(readFileSync(file, 'utf8')) as UpgradeRecord;
          from = record.from ?? from;
          to = record.to ?? to;
          phase = record.phase ?? phase;
          installation = record.installation ?? installation;
        }
      } catch {
        /* 单个损坏记录只展示警告，不阻止新的升级。 */
      }
      return { id: entry.name, from, to, phase, installation };
    });
  return { directory, entries };
}

export function updateInit(program: Command) {
  program
    .command('update')
    .description('基于官方模板升级框架（需确认覆盖，不自动操作数据库）')
    .option('--version <version>', '指定准确的目标稳定版本')
    .option('--config <path>', '自定义跳过规则文件')
    .option('--registry <url>', 'npm registry 地址')
    .option('--dry-run', '仅预览，不写入项目')
    .option('--history', '列出历史备份目录、版本和恢复命令，不执行升级')
    .option('--rollback <id>', '恢复升级批次的文件（不恢复数据库）')
    .option('--clear-history <id|all>', '交互确认后永久删除指定或全部历史备份，删除后不可回滚')
    .action(async (options: { version?: string; config?: string; registry?: string; dryRun?: boolean; rollback?: string; history?: boolean; clearHistory?: string }) => {
      try {
        const root = process.cwd();
        if (!existsSync(join(root, 'package.json'))) throw new Error('请在目标项目根目录运行');
        if (options.clearHistory !== undefined) {
          if (Object.keys(options).some((key) => key !== 'clearHistory')) throw new Error('--clear-history 请单独使用，不能与 history/rollback/version/dry-run/config/registry 等选项组合');
          await clearHistory(root, options.clearHistory, { confirm });
          return;
        }
        if (options.history) {
          if (options.rollback || options.version || options.config || options.registry || options.dryRun) throw new Error('--history 请单独使用');
          const history = readHistory(root);
          console.log(`备份目录：${history.directory}`);
          if (!history.entries.length) console.log('暂无升级历史备份');
          for (const entry of history.entries) {
            console.log(`\n${entry.id}\n版本：${entry.from} → ${entry.to}；文件状态：${entry.phase}；安装状态：${entry.installation}`);
            console.log(`恢复命令：pnpm exec meadmin update --rollback ${entry.id}`);
          }
          console.log('恢复到对应批次升级前的文件，不恢复数据库；记录损坏的批次需人工核验。');
          return;
        }
        if (options.rollback) {
          if (options.version || options.config || options.dryRun) throw new Error('--rollback 不能与升级选项组合');
          if (!validBackupId(options.rollback)) throw new Error('备份ID无效');
          if (await confirm(`将恢复批次 ${options.rollback} 的升级前文件，数据库不会恢复，是否继续？`)) rollback(root, join(root, 'node_modules/.meadmin/updates', options.rollback));
          return;
        }
        const from = currentVersion(root);
        const history = readHistory(root);
        if (history.entries.length > 3) console.warn(`升级备份过多：已有 ${history.entries.length} 个批次。请确认不再需要后，手动到 ${history.directory} 删除旧备份文件夹；删除后无法恢复对应批次。本次升级继续，不自动清理。`);
        if (history.entries.some((entry) => !['files-complete', 'rolled-back'].includes(entry.phase) || ['failed', 'running'].includes(entry.installation))) console.warn('历史中存在未完成或损坏的记录，请用 update --history 核对。本次升级不会因此被阻止。');
        const npmRegistry = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['config', 'get', 'registry'], { encoding: 'utf8', shell: process.platform === 'win32' });
        const registry = options.registry || process.env.npm_config_registry || (npmRegistry.status === 0 ? npmRegistry.stdout.trim() : '') || 'https://registry.npmjs.org';
        const manifest = await registryManifest(registry);
        const to = selectVersion(from, manifest.versions, options.version);
        if (from === to) {
          console.log(`已安装目标版本 ${to}，继续比较本地与目标模板内容，内容不同的文件按配置规则处理`);
        }
        const rulePath = options.config ? resolve(root, options.config) : join(root, 'meadmin.update.json');
        if (options.config && !existsSync(rulePath)) throw new Error('指定规则文件不存在');
        const config = existsSync(rulePath) ? validateConfig(JSON.parse(readFileSync(rulePath, 'utf8'))) : { skipExisting: {}, mergeSource: {} };
        const rules = config.skipExisting;
        const sourceRules = config.mergeSource;
        const workspace = mkdtempSync(join(tmpdir(), 'meadmin-update-'));
        const [oldTemplate, targetTemplate] = await Promise.all([downloadTemplate(manifest, from, join(workspace, 'old')), downloadTemplate(manifest, to, join(workspace, 'target'))]);
        const plan = makePlan(root, oldTemplate, targetTemplate, to, rules, sourceRules);
        if (from === to) {
          // 同版本同样处理内容差异，仅不重新交付数据库脚本。
          plan.changes = plan.changes.filter((item) => item.path !== 'update.sql' && item.path !== `meadmin-${to}.sql`);
          plan.sqlTables = [];
          plan.manual = plan.manual.filter((message) => !message.startsWith('SQL:') && !message.includes('未生成数据升级脚本'));
        }
        const git = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
        Log.log(`升级 ${from} → ${to}${from.split('.')[0] !== to.split('.')[0] ? '（跨主版本）' : ''}`);
        if (git.status === 0 && git.stdout.trim()) console.warn('工作区存在未提交修改，请先审查或提交。');
        for (const item of plan.changes) console.log(`${item.action}${item.conflict ? ' [本地冲突]' : ''}: ${item.path}`);
        for (const item of plan.skipped) console.log('跳过: ' + item);
        for (const item of plan.manual) console.warn('人工处理: ' + item);
        console.log('SQL候选插入（仅统计 INSERT 源行，不含 UPDATE，不代表数据库实际新增）:', plan.sqlTables);
        Log.log(`参考模板保留于：${workspace}`);
        Log.log(databaseReminder);
        if (options.dryRun) return;
        if (!(await confirm('警告：将覆盖上述文件，可能丢失业务修改；特殊文件仅按规则合并。是否继续？'))) return;
        const directory = applyPlan(root, plan, from, to);
        Log.log(`文件处理完成${plan.manual.length ? '，存在人工处理项' : ''}。备份：${directory}；批次：${basename(directory)}`);
        Log.log(`恢复本批次升级前文件：pnpm exec meadmin update --rollback ${basename(directory)}`);
        Log.log('依赖清单已合并（包含目标模板新增依赖），请执行 pnpm install 安装。');
        if (await confirm('是否现在执行 pnpm install？可能运行生命周期脚本；选择否后请手动执行。')) {
          const record = JSON.parse(readFileSync(join(directory, 'record.json'), 'utf8')) as UpgradeRecord;
          const installBackup = join(directory, 'before-install');
          mkdirSync(installBackup, { recursive: true });
          for (const name of new Set(['pnpm-lock.yaml', 'package.json', ...plan.changes.filter((change) => change.path.endsWith('/package.json')).map((change) => change.path)])) {
            if (existsSync(join(root, name))) {
              mkdirSync(join(installBackup, name, '..'), { recursive: true });
              copyFileSync(join(root, name), join(installBackup, name));
            }
          }
          record.installation = 'running';
          saveRecord(directory, record);
          const install = spawnSync(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', ['install'], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
          record.installation = install.status === 0 ? 'completed' : 'failed';
          saveRecord(directory, record);
          if (install.status !== 0) {
            console.warn('依赖安装失败，请手动处理，文件备份仍保留');
            process.exitCode = 1;
          }
        }
        Log.success(databaseReminder);
      } catch (error) {
        Log.error(error instanceof Error ? error.message : '', error);
        process.exitCode = 1;
      }
    });
}
