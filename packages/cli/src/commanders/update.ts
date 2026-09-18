import type { Command } from 'commander';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { applyPlan, rollback, saveRecord, type UpgradeRecord } from '../update/backup.js';
import { makePlan } from '../update/planner.js';
import { validateConfig } from '../update/rules.js';
import { compareVersions, currentVersion, downloadTemplate, registryManifest, selectVersion } from '../update/template.js';
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
`;
export function updateInit(program: Command) {
  program
    .command('update')
    .description('基于官方模板升级框架（需确认覆盖，不自动操作数据库）')
    .option('--version <version>', '指定准确的目标稳定版本')
    .option('--config <path>', '自定义跳过规则文件')
    .option('--registry <url>', 'npm registry 地址')
    .option('--dry-run', '仅预览，不写入项目')
    .option('--rollback <id>', '恢复升级批次的文件（不恢复数据库）')
    .action(async (options: { version?: string; config?: string; registry?: string; dryRun?: boolean; rollback?: string }) => {
      try {
        const root = process.cwd();
        if (!existsSync(join(root, 'package.json'))) throw new Error('请在目标项目根目录运行');
        if (options.rollback) {
          if (options.version || options.config || options.dryRun) throw new Error('--rollback 不能与升级选项组合');
          if (!/^[a-f0-9-]{36}$/.test(options.rollback)) throw new Error('备份ID无效');
          if (await confirm('将恢复本批次文件，数据库不会恢复，是否继续？')) rollback(root, join(root, '.meadmin/updates', options.rollback));
          return;
        }
        const from = currentVersion(root);
        const updates = join(root, '.meadmin/updates');
        if (existsSync(updates))
          for (const id of readdirSync(updates)) {
            const file = join(updates, id, 'record.json');
            if (!existsSync(file)) continue;
            const record = JSON.parse(readFileSync(file, 'utf8')) as UpgradeRecord;
            if (record.phase !== 'rolled-back' && (record.phase !== 'files-complete' || compareVersions(record.to, from) > 0 || ['failed', 'running'].includes(record.installation))) throw new Error(`存在待处理升级批次 ${id}，请先按报告完成依赖/人工处理或回滚`);
          }
        const npmRegistry = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['config', 'get', 'registry'], { encoding: 'utf8', shell: process.platform === 'win32' });
        const registry = options.registry || process.env.npm_config_registry || (npmRegistry.status === 0 ? npmRegistry.stdout.trim() : '') || 'https://registry.npmjs.org';
        const manifest = await registryManifest(registry);
        const to = selectVersion(from, manifest.versions, options.version);
        if (from === to) {
          console.log(`已是目标版本 ${to}，不重置本地文件`);
          return;
        }
        const rulePath = options.config ? resolve(root, options.config) : join(root, 'meadmin.update.json');
        if (options.config && !existsSync(rulePath)) throw new Error('指定规则文件不存在');
        const config = existsSync(rulePath) ? validateConfig(JSON.parse(readFileSync(rulePath, 'utf8'))) : { skipExisting: {}, mergeSource: {} };
        const rules = config.skipExisting;
        const sourceRules = config.mergeSource;
        const workspace = mkdtempSync(join(tmpdir(), 'meadmin-update-'));
        const [oldTemplate, targetTemplate] = await Promise.all([downloadTemplate(manifest, from, join(workspace, 'old')), downloadTemplate(manifest, to, join(workspace, 'target'))]);
        const plan = makePlan(root, oldTemplate, targetTemplate, to, rules, sourceRules);
        const git = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
        Log.log(`升级 ${from} → ${to}${from.split('.')[0] !== to.split('.')[0] ? '（跨主版本）' : ''}`);
        if (git.status === 0 && git.stdout.trim()) console.warn('工作区存在未提交修改，请先审查或提交。');
        for (const item of plan.changes) console.log(`${item.action}${item.conflict ? ' [本地冲突]' : ''}: ${item.path}`);
        for (const item of plan.skipped) console.log('跳过: ' + item);
        for (const item of plan.manual) console.warn('人工处理: ' + item);
        console.log('SQL候选插入（不代表数据库实际新增）:', plan.sqlTables);
        Log.log(`参考模板保留于：${workspace}`);
        Log.log(databaseReminder);
        if (options.dryRun) return;
        if (!(await confirm('警告：将覆盖上述文件，可能丢失业务修改；特殊文件仅按规则合并。是否继续？'))) return;
        const directory = applyPlan(root, plan, from, to);
        Log.log(`文件处理完成${plan.manual.length ? '，存在人工处理项' : ''}。备份：${directory}；批次：${basename(directory)}`);
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
