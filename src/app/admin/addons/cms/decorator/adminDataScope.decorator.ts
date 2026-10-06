import { Context } from '@midwayjs/koa';
import { REQUEST_OBJ_CTX_KEY } from '@midwayjs/core';

/**
 * CMS 管理员数据隔离装饰器
 * 
 * 用于 Service 层方法，自动为查询条件添加 createdAdminId 过滤
 * 仅当 ctx.adminInfo 存在时生效
 * 
 * 使用场景：
 * - 需要管理员只能查看/操作自己创建的数据
 * - 可以通过环境变量 CMS_ADMIN_DATA_SCOPE=true 全局启用
 * 
 * @param options.enabled - 是否启用数据隔离（默认从环境变量读取）
 * @param options.adminIdField - 管理员 ID 字段名（默认 'createdAdminId'）
 * 
 * @example
 * ```typescript
 * @AdminDataScope({ enabled: true })
 * async list(input: CmsQueryDto) {
 *   // where 条件会自动添加 createdAdminId 过滤
 * }
 * ```
 */
export interface AdminDataScopeOptions {
  enabled?: boolean;
  adminIdField?: string;
}

export function AdminDataScope(options: AdminDataScopeOptions = {}): MethodDecorator {
  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // 从环境变量读取全局开关，默认关闭
      const globalEnabled = process.env.CMS_ADMIN_DATA_SCOPE === 'true';
      const enabled = options.enabled !== undefined ? options.enabled : globalEnabled;
      
      if (!enabled) {
        return originalMethod.apply(this, args);
      }
      
      // 获取当前请求的 Context
      const ctx: Context = (this as any)[REQUEST_OBJ_CTX_KEY];
      if (!ctx || !ctx.adminInfo) {
        return originalMethod.apply(this, args);
      }
      
      const adminId = ctx.adminInfo.id;
      const adminIdField = options.adminIdField || 'createdAdminId';
      
      // 为第一个参数（通常是查询条件）添加管理员过滤
      if (args.length > 0 && typeof args[0] === 'object') {
        // 如果方法参数是 DTO，注入管理员过滤条件到内部使用
        (this as any).__adminDataScope = {
          adminId,
          adminIdField,
        };
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * 获取管理员数据隔离条件
 * 
 * 在 Service 方法内部调用，获取装饰器注入的管理员过滤条件
 * 
 * @param service - Service 实例（通常是 this）
 * @returns 管理员过滤条件对象，如果未启用则返回空对象
 * 
 * @example
 * ```typescript
 * async list(input: CmsQueryDto) {
 *   const where = { 
 *     deletedAt: null, 
 *     ...getAdminDataScopeWhere(this) 
 *   };
 *   return this.repository.findAll({ where });
 * }
 * ```
 */
export function getAdminDataScopeWhere(service: any): Record<string, string> {
  const scope = (service as any).__adminDataScope;
  if (!scope) return {};
  
  return {
    [scope.adminIdField]: scope.adminId,
  };
}

/**
 * 检查当前管理员是否有权访问指定数据
 * 
 * 用于单条记录操作前的权限检查
 * 
 * @param service - Service 实例（通常是 this）
 * @param record - 数据记录
 * @param adminIdField - 管理员 ID 字段名（默认 'createdAdminId'）
 * @returns 是否有权访问
 * 
 * @example
 * ```typescript
 * async update(id: string, data: any) {
 *   const row = await this.repository.findByPk(id);
 *   if (!canAccessAdminData(this, row)) {
 *     throw new ForbiddenError('无权操作此数据');
 *   }
 *   // 执行更新操作
 * }
 * ```
 */
export function canAccessAdminData(service: any, record: any, adminIdField = 'createdAdminId'): boolean {
  const scope = (service as any).__adminDataScope;
  if (!scope) return true; // 未启用数据隔离，默认允许访问
  
  return record[adminIdField] === scope.adminId;
}
