import { LoginService } from '@/app/admin/service/login.serveice.js';
import type { SystemAdmin } from '@/entities/systemAdmin.entity.js';
import { app, getContext } from '@meadmin/core';
import type { WhereOptions } from '@sequelize/core';
import { Op, sql } from '@sequelize/core';

// 数据权限默认配置
export const DATA_SCOPE_OPTIONS = {
  orgField: 'org_id' as string,
  adminField: 'created_admin_id' as string,
} as const;

// 数据权限: 1=全部; 2=组织; 3=组织及以下; 4=仅本人
type DataScope = 1 | 2 | 3 | 4;
type DataScopeOrganization = NonNullable<SystemAdmin['organizations']>[number];
export type DataScopeAdmin = Pick<SystemAdmin, 'id' | 'roles' | 'organizations'>;
export type DataScopeOptions = Partial<typeof DATA_SCOPE_OPTIONS> & {
  /** 显式指定管理员 ID，传入后优先使用该值。 */
  adminId?: string;
  /** 没有请求上下文时使用的管理员信息。 */
  admin?: DataScopeAdmin;
  /** 业务数据表的别名。 */
  tableAlias?: string;
};

const getAdmin = async (options: DataScopeOptions) => {
  if (options.admin) return options.admin;
  if (options.adminId) {
    return await (await (getContext() ?? app)?.getApplicationContext().getAsync(LoginService))?.getAdminById(options.adminId);
  }
  try {
    return getContext()?.adminInfo as DataScopeAdmin | undefined;
  } catch {
    return undefined;
  }
};

const getScope = (admin: DataScopeAdmin | undefined): DataScope => {
  const roles = admin?.roles ?? [];
  const scopes = roles.map(({ dataScope }) => dataScope as DataScope);
  if (roles.some(({ isSuper }) => isSuper === 1) || scopes.includes(1) || !scopes.length) return 1;
  if (scopes.includes(3)) return 3;
  if (scopes.includes(2)) return 2;
  return 4;
};

const getOrganizationIds = (admin: DataScopeAdmin | undefined, scope: DataScope) => [
  ...new Set(
    admin?.organizations?.flatMap((organization) => {
      const descendants = (organization as DataScopeOrganization & { descendants?: DataScopeOrganization[] }).descendants ?? [];
      return scope === 3 ? [organization.id, ...descendants.map(({ id }) => id)] : [organization.id];
    }) ?? [],
  ),
];

/**
 * 根据当前管理员的数据权限生成 Sequelize where 条件。
 * 管理员的 organizations 已由 LoginService.getAdminById 加载为完整组织范围。
 */
export const getDataScopeWhere = async <T extends Record<string, unknown> = Record<string, unknown>>(options: DataScopeOptions = {}) => {
  const admin = await getAdmin(options);
  const scope = getScope(admin);
  if (scope === 1) return {};

  const tableAlias = options.tableAlias;
  const orgField = options.orgField ?? DATA_SCOPE_OPTIONS.orgField;
  const adminField = options.adminField ?? DATA_SCOPE_OPTIONS.adminField;
  const orgKey = tableAlias ? `$${tableAlias}.${orgField}$` : orgField;
  const adminKey = tableAlias ? `$${tableAlias}.${adminField}$` : adminField;
  const orgIds = getOrganizationIds(admin, scope);
  const adminId = options.adminId ?? admin?.id ?? '';

  if (scope === 4) return { [adminKey]: adminId } as WhereOptions<T>;
  return { [orgKey]: { [Op.in]: orgIds } } as WhereOptions<T>;
};

/**
 * 根据当前管理员的数据权限生成 Sequelize SQL 片段。
 * 组织及以下权限直接使用 LoginService 已加载的完整组织 ID，不在此处查询数据库。
 */
export const getDataScopeSql = async (options: DataScopeOptions = {}) => {
  const admin = await getAdmin(options);
  const scope = getScope(admin);
  if (scope === 1) return sql``;

  const tableAlias = options.tableAlias;
  const orgField = options.orgField ?? DATA_SCOPE_OPTIONS.orgField;
  const adminField = options.adminField ?? DATA_SCOPE_OPTIONS.adminField;
  const orgColumn = tableAlias ? sql.identifier(tableAlias, orgField) : sql.identifier(orgField);
  const adminColumn = tableAlias ? sql.identifier(tableAlias, adminField) : sql.identifier(adminField);
  const adminId = options.adminId ?? admin?.id ?? '';

  if (scope === 4) return sql`${adminColumn} = ${adminId}`;

  const orgIds = getOrganizationIds(admin, scope);
  if (!orgIds.length) return sql`1 = 0`;
  return sql`${orgColumn} IN ${sql.list(orgIds)}`;
};
