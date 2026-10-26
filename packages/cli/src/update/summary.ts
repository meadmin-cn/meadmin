/**
 * 升级结束后「仍需手动处理」清单。
 *
 * 抽成纯函数是为了能测：这份清单曾经漏掉 pnpm install（模板新增依赖没装，前后端都起不来），
 * 肉眼很难发现「少了一条」，但测试能直接断言每一条何时出现。
 */
export type RemainingInput = {
  /** 依赖是否已安装成功（答否、装失败都算没有） */
  installed: boolean;
  /** 表结构是否已同步 */
  synced: boolean;
  /** 同步是否执行失败（与「用户拒答」区分：失败时后续步骤都没做） */
  syncFailed: boolean;
  /** 本次是否生成了 update.sql */
  sqlReady: boolean;
  /** update.sql 是否已执行 */
  sqlExecuted: boolean;
  /** 树关系是否已自动修复 */
  treesRepaired: boolean;
  /** update.sql 的文件名，默认 update.sql */
  sqlPath: string;
  /** 即 -m 的值；有值时手动命令要带上，否则会连到默认 env 的库 */
  env?: string;
};

export function buildRemaining(input: RemainingInput): string[] {
  const remaining: string[] = [];
  const envSuffix = input.env ? ` -m ${input.env}` : '';
  if (!input.installed) remaining.push('安装依赖：pnpm install（依赖清单已合并，新增依赖未安装可能导致启动失败）');
  if (!input.synced && !input.syncFailed) remaining.push(`备份数据库后执行：pnpm exec meadmin sync '*'${envSuffix} 同步表结构`);
  if (input.sqlReady && !input.sqlExecuted && !input.syncFailed) remaining.push(`再人工执行 ${input.sqlPath}（建议先比较版本SQL与现有数据库，在测试环境验证）`);
  if (!input.treesRepaired) remaining.push('在后台依次执行菜单、组织、角色的「修复树关系」');
  remaining.push('刷新/重新登录并核对菜单授权、组织数据范围和业务功能');
  return remaining;
}
