<template>
  <div class="role">
    <me-vxe-table
      ref="roleRef"
      v-model:quick-search="searchText"
      :data="data || []"
      :loading="loading"
      :row-config="{ isCurrent: true, useKey: true }"
      :tree-config="{ expandAll: true, showLine: true }"
      :column-config="{ useKey: true }"
      :custom-column="false"
      :print="false"
      :export-menu="[]"
      :quick-search-placeholder="t('输入角色名称快捷查询')"
      :onAdd="permission('system_role_add')?showAddOrUp:undefined"
      show-overflow
      height="auto"
      me-class="table-role"
      @current-row-change="roleChange"
      @refresh="getRole"
      @quick-search="search"
    >
      <vxe-column field="name" :title="t('角色组')" tree-node>
        <template #default="{ row }">
          <div class="role-item">
            <div>
              <span v-html="row.roleName"></span>
              &nbsp;<el-tag v-if="row.status === 0" size="small" type="info">{{ t('禁用') }}</el-tag>
              <el-tag v-else size="small" type="primary">{{ t('启用') }}</el-tag>
            </div>
            <div class="role-item-btn">
              <me-button v-if="permission('system_role_info')" @click="showInfo(row.id)" link :title="t('详情')">
                <mel-icon-memo />
              </me-button>
              <template v-if="row.isSuper === 0">
                <me-button v-if="permission('system_role_edit')" type="primary" link @click="showAddOrUp(row.id)" :title="t('编辑')"><mel-icon-edit /></me-button>
                <me-button v-if="permission('system_role_del')" type="danger" link style="margin-left: 5px" @click="del(row.id)" :title="t('删除')"><mel-icon-delete /></me-button>
              </template>
            </div>
          </div>
        </template>
      </vxe-column>
    </me-vxe-table>
  </div>
</template>
<script setup lang="ts" name="Group">
import { delSystemRoleApi, SystemRoleInfo, SystemRoleTreeAll, systemRoleTreeAllApi, updateSystemRoleApi } from '@/api/system/role';
import { useActionModel } from '@/hooks/index.js';
import { useLocalesI18n } from '@/locales/i18n';
import { searchTreeTable } from '@/utils/helper.js';
import { cloneDeep } from 'lodash-es';
import { VxeTableEvents } from 'vxe-table';
import AddOrUp from './components/addOrUp.vue';
import Info from './components/info.vue';
import { permission } from '@/utils/permission.js';
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'systemRole']);
const roleRef = ref<MeVxeTableInstance>();
const emit = defineEmits<{
  currentChange: [menuIds: string[], isSuper: 0 | 1];
}>();

const roleChange: VxeTableEvents.CurrentRowChange<SystemRoleInfo> = ({ row }) => {
  emit(
    'currentChange',
    row.menus.map((menu) => menu.id),
    row.isSuper,
  );
};
const { open } = useActionModel(AddOrUp);
const { open: openInfo } = useActionModel(Info);
const { loading, runAsync } = systemRoleTreeAllApi();
const { runAsync: delRun } = delSystemRoleApi();
const { runAsync: updateSystemRoleApiRunAsync } = updateSystemRoleApi();
let dataCopy = [] as SystemRoleTreeAll;
const data = ref<SystemRoleTreeAll>([]);
const searchText = ref('');
const search = (searchText = '') => {
  data.value = searchTreeTable(searchText, ['roleName'] as const, dataCopy);
  nextTick(() => roleRef.value?.vxeTableRef?.setAllTreeExpand(true));
};
const getRole = async () => {
  dataCopy = cloneDeep(await runAsync());
  emit('currentChange', [], 0);
  search(searchText.value);
};
const delId = ref<string>();
const del = async (id: string) => {
  delId.value = id;
  await delRun(id);
  await search();
};
const showAddOrUp = (id?: string) => {
  open({
    id,
    onSuccess: async () => {
      await getRole();
    },
  });
};
const setRoleMenu = async (menuIds?: string[]) => {
  if (!menuIds) {
    return false;
  }
  const row = roleRef.value!.vxeTableRef!.getCurrentRecord();
  if (row) {
    await updateSystemRoleApiRunAsync(row.id, { menuIds });
    row.menus = menuIds.map((id) => ({ id }));
    return true;
  }
  ElMessage.error(t('请先选择角色'));
};
const showInfo = (id?: string) => {
  openInfo({ id });
};
defineExpose({ setRoleMenu });
await Promise.all([loadRes, getRole()]);
</script>
<style lang="scss" scoped>
.role {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  .table-role {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.me-vxe-body) {
      flex-grow: 1;
    }

    .role-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;

      .role-item-btn {
        display: none;
      }
    }

    :deep(.row--current) {
      .role-item-btn {
        display: block;
      }
    }
  }
}
</style>
