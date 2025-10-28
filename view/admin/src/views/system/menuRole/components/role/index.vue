<template>
  <div class="role">
    <me-vxe-table
      ref="roleRef"
      v-model:quick-search="searchText"
      :data="data||[]"
      :loading="loading"
      :row-config="{ isCurrent: true, useKey: true }"
      :tree-config="{ expandAll: true, line: true }"
      :column-config="{ useKey: true }"
      :custom-column="false"
      :print="false"
      :export-menu="[]"
      show-overflow
      height="auto"
      me-class="table-role"
      @current-row-change="roleChange"
      @add="showAddOrUp()"
      @refresh="getRole"
      @quick-search="search"
    >
      <vxe-column field="name" :title="t('角色')" tree-node>
        <template #default="{ row }">
          <div class="role-item">
            <div>
              <span v-html="row.roleName"></span>
              &nbsp;<el-tag v-if="row.status === 0" size="small" type="info">禁用</el-tag>
            </div>
            <div class="role-item-btn">
              <el-link type="primary" :underline="false" @click="showAddOrUp(row.id)"><mel-icon-edit /></el-link>
              <el-link type="danger" :underline="false" style="margin-left: 5px" @click="del(row.id)"
                ><mel-icon-delete/></el-link>
            </div>
          </div>
        </template>
      </vxe-column>
    </me-vxe-table>
  </div>
</template>
<script setup lang="ts" name="Group">
import { systemRoleTreeAllApi, SystemRoleListParam, delSystemRoleApi, SystemRoleInfo, SystemRoleTreeAll, updateSystemRoleApi } from '@/api/system/role';
import { useLocalesI18n } from '@/locales/i18n';
import AddOrUp from './components/addOrUp.vue';
import { useActionModel } from '@/hooks/index.js';
import { formatterStr, formatterAt, searchTreeTable } from '@/utils/helper.js';
import { VxeColumnPropTypes, VxeTableEvents } from 'vxe-table';
import { cloneDeep } from 'lodash-es';
let { t } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'systemRole']);

const roleRef = ref<MeVxeTableInstance>();
const dict = {
  status: [
    { value: 1, label: t('启用') },
    { value: 0, label: t('禁用') },
  ],
};
const formatterDict: VxeColumnPropTypes.Formatter<SystemRoleInfo> = ({ cellValue, column }) => {
  //因为ts类型判定不得不断言dict
  return formatterStr({ cellValue: (dict as Record<string, { value: string | number; label: string }[]>)[column.field]?.find((item) => item.value == cellValue)?.label });
};
const emit = defineEmits<{
  currentChange: [menuIds: string[]]
}>()

const roleChange: VxeTableEvents.CurrentRowChange<SystemRoleInfo> = ({ row }) =>{
  emit('currentChange', row.menus.map(menu=>menu.id));
}
const { open } = useActionModel(AddOrUp);
const params = reactive(new SystemRoleListParam());
const { loading, runAsync } = systemRoleTreeAllApi();
const { runAsync: delRun, loading: delLoading } = delSystemRoleApi();
let dataCopy = [] as SystemRoleTreeAll;
const data = ref<SystemRoleTreeAll>([]);
const searchText = ref('');
const search = (searchText ='') => {
  data.value = searchTreeTable(searchText, ['roleName'] as const, dataCopy);
  nextTick(() => roleRef.value?.vxeTableRef?.setAllTreeExpand(true));
};
const getRole = async () => {
  dataCopy = cloneDeep(await runAsync());
  emit('currentChange', []);
  search(searchText.value);
};
getRole();
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
await search();
const setRoleMenu = async (menuIds?: string[]) => {
  if (!menuIds) {
    return false;
  }
  const row = roleRef.value!.vxeTableRef!.getCurrentRecord();
  if (row) {
    await updateSystemRoleApi().runAsync(row.id, { menuIds });
    row.menus = menuIds.map(id=>({id}));
    return true;
  }
  ElMessage.error(t('请先选择角色'));
};
defineExpose({ setRoleMenu });
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
