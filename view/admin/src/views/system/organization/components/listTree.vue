<template>
  <div class="list-tree">
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
      :quick-search-placeholder="t('输入组织名称快捷查询')"
      :on-add="permission('system_organization_add') ? showAddOrUp : undefined"
      show-overflow
      height="auto"
      me-class="table-role"
      @current-row-change="roleChange"
      @refresh="getOrg"
      @quick-search="search"
    >
      <vxe-column field="name" :title="t('组织')" tree-node>
        <template #default="{ row }">
          <div class="role-item">
            <div>
              <span v-html="row.roleName"></span>
              &nbsp;<el-tag v-if="row.status === 0" size="small" type="info">{{ t('禁用') }}</el-tag>
              <el-tag v-else size="small" type="primary">{{ t('启用') }}</el-tag>
            </div>
            <div class="role-item-btn">
              <me-button v-if="permission('system_role_info')" link :title="t('详情')" @click="showInfo(row.id)">
                <mel-icon-memo />
              </me-button>
              <template v-if="row.isSuper === 0">
                <me-button v-if="permission('system_organization_edit')" type="primary" link :title="t('编辑')" @click="showAddOrUp(row.id)"><mel-icon-edit /></me-button>
                <me-button v-if="permission('system_organization_del')" type="danger" link style="margin-left: 5px" :title="t('删除')" @click="del(row.id)"><mel-icon-delete /></me-button>
              </template>
            </div>
          </div>
        </template>
      </vxe-column>
    </me-vxe-table>
  </div>
</template>

<script setup lang="ts" name="OrgListTree">
import type { SystemOrganizationInfo, SystemOrganizationTreeAll } from '@/api/system/organization';
import { delSystemOrganizationApi, systemOrganizationTreeAllApi, updateSystemOrganizationApi } from '@/api/system/organization';
import { useActionModel } from '@/hooks/index.js';
import { useLocalesI18n } from '@/locales/i18n';
import { searchTreeTable } from '@/utils/helper.js';
import { permission } from '@/utils/permission.js';
import { cloneDeep } from 'lodash-es';
import type { VxeTableEvents } from 'vxe-table';
import AddOrUp from './components/addOrUp.vue';
import Info from './components/info.vue';
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'systemRole']);
const roleRef = ref<MeVxeTableInstance>();
const emit = defineEmits<{
  currentChange: [orgId: string | null];
}>();

const roleChange: VxeTableEvents.CurrentRowChange<SystemOrganizationInfo> = ({ row }) => {
  emit('currentChange', row.id);
};
const { open } = useActionModel(AddOrUp);
const { open: openInfo } = useActionModel(Info);
const { loading, runAsync } = systemOrganizationTreeAllApi();
const { runAsync: delRun } = delSystemOrganizationApi();
const { runAsync: updateSystemOrganizationApiRunAsync } = updateSystemOrganizationApi();
let dataCopy = [] as SystemOrganizationTreeAll;
const data = ref<SystemOrganizationTreeAll>([]);
const searchText = ref('');
const search = (searchText = '') => {
  data.value = searchTreeTable(searchText, ['orgName'] as const, dataCopy);
  nextTick(() => roleRef.value?.vxeTableRef?.setAllTreeExpand(true));
};
const getOrg = async () => {
  dataCopy = cloneDeep(await runAsync());
  emit('currentChange', null);
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
      await getOrg();
    },
  });
};
const setRoleMenu = async (adminIds?: string[]) => {
  if (!adminIds) {
    return false;
  }
  const row = roleRef.value!.vxeTableRef!.getCurrentRecord();
  if (row) {
    row.admins = adminIds.map((id) => ({ id }));
    await updateSystemOrganizationApiRunAsync(row.id, { admins: row.admins });
    return true;
  }
  ElMessage.error(t('请先选择组织'));
};
const showInfo = (id?: string) => {
  openInfo({ id });
};
defineExpose({ setRoleMenu });
await Promise.all([loadRes, getOrg()]);
</script>
<style lang="scss" scoped>
.list-tree {
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
