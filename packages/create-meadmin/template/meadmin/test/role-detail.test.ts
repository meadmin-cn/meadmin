import assert from 'node:assert/strict';
import { SystemRoleService } from '../src/app/admin/service/system/role.service.js';
import { getDataScopeWhere } from '../src/helper/dataScope.js';
import type { DataScopeAdmin } from '../src/helper/dataScope.js';

const setup = (isSuper: number, dataScope: number, overrides: Record<string, unknown> = {}) => {
  const stored = { id: 'role-child', parentId: 'role-parent', roleName: '测试角色', roleKey: 'test', isSuper, dataScope, menus: [{ id: 'assigned-menu', title: '已分配菜单' }], ...overrides };
  const entity = {
    ...stored,
    parent: null as { id: string; roleName: string } | null,
    get(options: { plain: boolean }) {
      assert.deepEqual(options, { plain: true });
      return { ...stored, parent: this.parent, menus: stored.menus.map((menu) => ({ ...menu })) };
    },
    save() {
      assert.fail('查询详情不得保存实体');
    },
  };
  const service = new SystemRoleService();
  let menuQueries = 0;
  service.SystemRoleRepository = {
    async findByPk(id: string) {
      if (id === stored.id) return entity;
      assert.equal(id, stored.parentId);
      return { id, roleName: '父角色' };
    },
  } as unknown as SystemRoleService['SystemRoleRepository'];
  service.SystemMenuRepository = {
    async findAll(options: unknown) {
      assert.deepEqual(options, { attributes: ['id'] });
      menuQueries++;
      return [{ id: 'assigned-menu' }, { id: 'other-menu' }];
    },
  } as unknown as SystemRoleService['SystemMenuRepository'];
  return { service, stored, entity, menuQueries: () => menuQueries };
};

describe('超级管理员角色详情数据权限', () => {
  for (const scope of [1, 2, 3, 4]) {
    it(`超级管理员存储权限为${scope}时返回全部权限且不写回实体`, async () => {
      const { service, stored, entity, menuQueries } = setup(1, scope);
      const result = await service.findOne(stored.id);
      assert.equal(result.dataScope, 1);
      const serialized = JSON.parse(JSON.stringify(result)) as Record<string, unknown>;
      assert.equal(serialized.dataScope, 1);
      assert.equal(entity.dataScope, scope);
      assert.equal(stored.dataScope, scope);
      assert.deepEqual(result.menus, [{ id: 'assigned-menu' }, { id: 'other-menu' }]);
      assert.equal(menuQueries(), 1);
      assert.deepEqual(result.parent, { id: stored.parentId, roleName: '父角色' });
    });

    it(`普通角色存储权限为${scope}时保持原值与已分配菜单`, async () => {
      const { service, stored, entity, menuQueries } = setup(0, scope);
      const result = await service.findOne(stored.id);
      assert.equal(result.dataScope, scope);
      assert.equal(entity.dataScope, scope);
      assert.deepEqual(result.menus, [{ id: 'assigned-menu' }]);
      assert.equal(menuQueries(), 0);
    });
  }

  it('名称为超级管理员且位于根节点也不能代替isSuper标记', async () => {
    const { service, stored } = setup(0, 4, { id: '1', parentId: null, roleName: '超级管理员', roleKey: 'root' });
    const result = await service.findOne(stored.id);
    assert.equal(result.dataScope, 4);
    assert.deepEqual(result.menus, [{ id: 'assigned-menu' }]);
  });

  it('不存在的角色保持原有错误', async () => {
    const service = new SystemRoleService();
    service.SystemRoleRepository = { async findByPk() { return null; } } as unknown as SystemRoleService['SystemRoleRepository'];
    service.i18nService = { translate: () => '没有对应的信息' } as unknown as SystemRoleService['i18nService'];
    await assert.rejects(service.findOne('missing'), /没有对应的信息/);
  });

  it('详情展示不会改变超级管理员与普通角色的有效数据权限', async () => {
    const admin = (isSuper: number, dataScope: number) => ({ id: 'admin-test', roles: [{ isSuper, dataScope }], organizations: [] }) as unknown as DataScopeAdmin;
    assert.deepEqual(await getDataScopeWhere({ admin: admin(1, 4) }), {});
    assert.deepEqual(await getDataScopeWhere({ admin: admin(0, 1) }), {});
    assert.deepEqual(await getDataScopeWhere({ admin: admin(0, 4) }), { created_admin_id: 'admin-test' });
  });
});
