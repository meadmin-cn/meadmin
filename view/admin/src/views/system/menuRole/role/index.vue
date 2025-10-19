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
      @current-change="groupChange"
      @add="showAddOrEditor()"
      @refresh="getGroup"
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
                ><mel-icon-delete
              /></el-link>
            </div>
          </div>
        </template>
      </vxe-column>
    </me-vxe-table>
  </div>
</template>
<script setup lang="ts" name="Group">
import { systemRoleTreeAllApi, SystemRoleListParam, delSystemRoleApi, SystemRoleInfo, SystemRoleTreeAll } from '@/api/system/role';
import { useLocalesI18n } from '@/locales/i18n';
import AddOrUp from './components/addOrUp.vue';
import { useActionModel } from '@/hooks/index.js';
import { formatterStr, formatterAt, searchTreeTable } from '@/utils/helper.js';
import { VxeColumnPropTypes } from 'vxe-table';
import { cloneDeep } from 'lodash-es';
const roleRef = ref<MeVxeTableInstance>();
const dict = {
  status: [
    { value: 1, label: '启用' },
    { value: 0, label: '禁用' },
  ],
};
const formatterDict: VxeColumnPropTypes.Formatter<SystemRoleInfo> = ({ cellValue, column }) => {
  //因为ts类型判定不得不断言dict
  return formatterStr({ cellValue: (dict as Record<string, { value: string | number; label: string }[]>)[column.field]?.find((item) => item.value == cellValue)?.label });
};
const emit = defineEmits<{
  (e: 'currentChange', row: string[]): void;
}>();
const { open } = useActionModel(AddOrUp);
let { t } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'systemRole']);
const params = reactive(new SystemRoleListParam());
const { loading, runAsync } = systemRoleTreeAllApi();
const { runAsync: delRun, loading: delLoading } = delSystemRoleApi();
let dataCopy = [] as SystemRoleTreeAll;
const data = ref<SystemRoleTreeAll>([]);
const searchText = ref('');
const search = (searchText ='') => {
  data.value = searchTreeTable(searchText, ['roleName'] as const, dataCopy);
  nextTick(() => roleRef.value!.vxeTableRef!.setAllTreeExpand(true));
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
      await search();
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
    await editGroupApi().runAsync(row.id, { menus });
    row.menus = menuIds.map(id=>({id}));
    return true;
  }
  ElMessage.error('请先选择分组');
};
defineExpose({ setRoleMenu });
</script>
<style lang="scss" scoped>
.role {
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
