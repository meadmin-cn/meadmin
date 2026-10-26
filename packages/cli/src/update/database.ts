import type { Sequelize as SequelizeInstance } from '@sequelize/core';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultDbConfig, getConfig, projectCore } from '../utils/db.js';
import { Log } from '../utils/log.js';

/**
 * 同一进程内复用一条连接。
 * 模型类来自项目配置模块（import 缓存，是同一批 class），每 `new Sequelize` 都会重新 addModels，
 * 第二次就会抛 `This DataType is already attached to attribute X#y`。update 的流程恰好是
 * 「执行 update.sql → 修复树关系」两次连接，所以必须复用，并在结束时统一 close。
 */
let session: { root: string; sequelize: SequelizeInstance } | undefined;

async function connect(root: string): Promise<SequelizeInstance> {
  if (session?.root === root) return session.sequelize;
  const config = Object.assign(await getConfig(defaultDbConfig(root), undefined, root), { logging: false });
  // 打印目标库（不含账号密码）：update.sql 会改数据，连错库代价太大
  const target = [config.host && `${config.host}:${config.port ?? 5432}`, config.database, config.schema].filter(Boolean).join(' / ');
  if (target) Log.log(`数据库目标：${target}`);
  const { Sequelize: ProjectSequelize } = await projectCore(root);
  const sequelize = new ProjectSequelize(config);
  session = { root, sequelize };
  return sequelize;
}

/** 关闭并丢弃当前连接；由调用方在整段数据库操作结束后调用。 */
export async function closeDatabase(): Promise<void> {
  const current = session;
  session = undefined;
  if (current) await current.sequelize.close();
}

/**
 * 真的执行 `meadmin sync '*'`：起一个子进程跑同一份 CLI 入口，而不是在进程内复刻它的逻辑。
 * 这样 sync 命令以后加东西（模型加载、日志、额外步骤）update 自动跟着走，不会出现两套实现漂移；
 * 用户看到的输出也和手动敲这条命令完全一致。
 * 用 process.execPath + CLI 入口而不是 `pnpm exec`：不依赖 pnpm 是否在 PATH，也不触发 pnpm 递归调用。
 * `env`（即 update 的 `-m`）原样透传：子进程据此加载同一份 `.env.<env>`，否则会连错库。
 */
export async function syncDatabase(root: string, env = process.env.NODE_ENV?.trim()): Promise<void> {
  const entry = fileURLToPath(new URL('../index.js', import.meta.url));
  if (!existsSync(entry)) throw new Error(`找不到 CLI 入口 ${entry}，无法执行 meadmin sync`);
  const args = env ? ['sync', '*', '-m', env] : ['sync', '*'];
  const printable = `meadmin ${args.map((arg) => (arg === '*' ? "'*'" : arg)).join(' ')}`;
  Log.log(`正在执行 ${printable} ...`);
  const result = spawnSync(process.execPath, [entry, ...args], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${printable} 执行失败（退出码 ${result.status ?? 'null'}）`);
  Log.success(`${printable} 执行完成`);
}

/** 执行项目根目录下的 SQL 文件；文件自带 BEGIN/COMMIT，不再额外包一层事务。 */
export async function executeSqlFile(root: string, path: string): Promise<void> {
  const file = join(root, path);
  if (!existsSync(file)) throw new Error(`找不到 ${path}，请确认已生成`);
  const content = readFileSync(file, 'utf8');
  if (!content.trim()) throw new Error(`${path} 内容为空，未执行`);
  const sequelize = await connect(root);
  Log.log(`正在执行 ${path} ...`);
  await sequelize.queryRaw(content);
  Log.success(`${path} 执行完成`);
}

/**
 * 修复树关系：直接调用实体上的静态 `perfectTree()`，与后台「修复树关系」按钮是同一份实现
 * （`src/entities/abstract/adminTree.entity.ts`），不在 CLI 里另写一套嵌套集重算。
 * update.sql 只插数据、不会维护 left/right，所以执行完必须跑一次，否则树是错的。
 */
export async function repairTrees(root: string): Promise<string[]> {
  const names = ['SystemMenu', 'SystemOrganization', 'SystemRole'];
  const sequelize = await connect(root);
  const repaired: string[] = [];
  for (const name of names) {
    const model = sequelize.models.get(name) as unknown as { perfectTree?: () => Promise<unknown> } | undefined;
    if (!model) throw new Error(`未找到模型 ${name}，无法修复树关系`);
    if (typeof model.perfectTree !== 'function') throw new Error(`模型 ${name} 缺少 perfectTree 方法`);
    await model.perfectTree.call(model);
    repaired.push(name);
  }
  return repaired;
}

export type DatabaseStepsDeps = {
  confirm: (message: string) => Promise<boolean>;
  sync: () => Promise<void>;
  executeSql: () => Promise<void>;
  repairTrees: () => Promise<string[]>;
  error: (message: string) => void;
};

export type DatabaseStepsResult = {
  /** 依次问过的提示语，用于断言「update.sql 是最后一句」 */
  questions: string[];
  synced: boolean;
  sqlExecuted: boolean;
  /** sync 执行抛错（不是用户拒答）；此时 update.sql 未执行，需明确提示人工补做 */
  syncFailed: boolean;
  /** 菜单/组织/角色树关系是否已自动修复（只在 update.sql 执行成功后才会做） */
  treesRepaired: boolean;
};

/**
 * 升级完成后的数据库两步：先 sync 建表，再执行 update.sql。
 * 顺序不能反——update.sql 只含数据、没有 DDL，表还没建好就执行必然失败。
 * sync 执行**失败**（连不上库等）时中止，不再询问 update.sql；只是用户**拒答** sync 时仍然询问，
 * 但会在问题里点明「表结构尚未同步」，因为库里可能早已手动建好表。
 * update.sql 执行成功后**自动**跑一次「修复树关系」——它灌进来的菜单/组织/角色只有 parent_id，
 * 不重算 left/right 树就是坏的；没执行 update.sql 时保持原样，交给用户手动修复。
 */
export async function runDatabaseSteps(options: { sqlReady: boolean; sqlPath: string; deps: DatabaseStepsDeps }): Promise<DatabaseStepsResult> {
  const { sqlReady, sqlPath, deps } = options;
  const result: DatabaseStepsResult = { questions: [], synced: false, sqlExecuted: false, syncFailed: false, treesRepaired: false };
  const ask = async (message: string) => {
    result.questions.push(message);
    return await deps.confirm(message);
  };
  try {
    if (await ask("是否现在执行 meadmin sync '*' 同步表结构？缺表/缺字段时必须执行，会改动数据库表结构。")) {
      await deps.sync();
      result.synced = true;
    }
  } catch (error) {
    result.syncFailed = true;
    deps.error(`同步表结构失败：${error instanceof Error ? error.message : String(error)}。已中止后续数据库步骤，文件升级不受影响。`);
    return result;
  }
  if (!sqlReady) return result;
  try {
    const caution = result.synced ? '' : '表结构尚未同步，缺表时执行会失败；';
    if (await ask(`是否现在执行 ${sqlPath}？${caution}会修改数据库数据、不保证幂等，请确认已备份数据库。`)) {
      await deps.executeSql();
      result.sqlExecuted = true;
    }
  } catch (error) {
    deps.error(`执行 ${sqlPath} 失败：${error instanceof Error ? error.message : String(error)}。文件升级不受影响，请核对后手动重试。`);
    return result;
  }
  if (!result.sqlExecuted) return result;
  // 数据灌进去了，树关系必须跟着重算；这一步不再询问，失败则回落到手动提示
  try {
    const repaired = await deps.repairTrees();
    result.treesRepaired = true;
    Log.success(`已自动修复树关系：${repaired.join('、')}`);
  } catch (error) {
    deps.error(`自动修复树关系失败：${error instanceof Error ? error.message : String(error)}。请在后台依次点一次菜单、组织、角色的「修复树关系」。`);
  }
  return result;
}
