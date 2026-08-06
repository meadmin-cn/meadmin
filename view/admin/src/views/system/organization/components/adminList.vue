<template>
  <div class="admin-list">
    <me-vxe-table
      ref="menuRef"
      v-model:quick-search="searchText"
      :data="data?.list ?? []"
      :loading="loading"
      :custom-column="false"
      :tree-config="{ expandAll: true, showLine: true, reserve: true }"
      :checkbox-config="{ labelField: 'id' }"
      :row-config="{ keyField: 'id', useKey: true }"
      :column-config="{ useKey: true }"
      :pagination-options="{
        currentPage: params.page,
        pageSize: params.pageSize,
        total: data?.total ?? 0,
        layout: 'sizes, prev, pager, next, jumper, ->, total',
        change: search,
      }"
      :quick-search-placeholder="t('输入用户名/昵称/手机号快捷查询')"
      :on-add="permission('system_admin_add') ? showAddOrUp : undefined"
      align="center"
      border
      me-class="table-admin-list"
      height="auto"
      show-overflow
      @refresh="search"
      @quick-search="() => search(1)"
    >
      <vxe-column field="id" :title="t('ID')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="username" :title="t('用户名')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="nickname" :title="t('昵称')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="avatar" :title="t('头像')">
        <template #default="{ row }: { row: SystemAdminInfo }">
          <me-files-view :files="row.avatar ? [row.avatar] : []"></me-files-view>
        </template>
      </vxe-column>
      <vxe-column field="email" :title="t('邮箱')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="mobile" :title="t('手机号')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="loginFailure" :title="t('登录失败次数')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="lastLoginAt" :title="t('最后登录时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column field="lastLoginIp" :title="t('最后登录ip')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="status" :title="t('状态')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="roles" :title="t('具有的角色')" :formatter="formatterArrFn((obj) => obj.roleName)"></vxe-column>
      <vxe-column field="createdAt" :title="t('创建时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column field="updatedAt" :title="t('最后更新时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column v-if="permission(['system_admin_info', 'system_admin_edit', 'system_admin_del'])" title="操作" fixed="right">
        <template #default="{ row }">
          <me-button v-if="permission('system_admin_info')" link :title="t('详情')" @click="showInfo(row.id)">
            <mel-icon-memo />
          </me-button>
          <me-button v-if="permission('system_admin_edit')" link :title="t('编辑')" @click="showAddOrUp(row.id)"><mel-icon-edit /></me-button>
          <el-popconfirm v-if="permission('system_admin_del')" :title="t('确认删除？')" placement="left" @confirm="del(row.id)">
            <template #reference>
              <me-button :key="row.id" :loading="delLoading && delId === row.id" :title="t('删除')" link type="danger">
                <mel-icon-delete />
              </me-button>
            </template>
          </el-popconfirm>
        </template>
      </vxe-column>
      <template #buttons>
        <me-button type="success" @click="showSelectAdmin"> {{ t('添加关联用户') }} </me-button>
      </template>
    </me-vxe-table>
  </div>
</template>

<script setup lang="ts" name="OrgAdminList">
import { delSystemAdminApi, systemAdminListApi, SystemAdminListParam, type SystemAdminInfo } from '@/api/system/admin';
import { updateSystemOrganizationApi } from '@/api/system/organization.js';
import { useActionModel } from '@/hooks';
import { useLocalesI18n } from '@/locales/i18n';
import { createformatterDictFn, formatterArrFn, formatterAt, formatterStr } from '@/utils/helper.js';
import { permission } from '@/utils/permission.js';
import AddOrUp from '../../admin/components/addOrUp.vue';
import Info from '../../admin/components/info.vue';
import { getDict } from '../../admin/dict.js';
import SelectAdmin from '../../admin/selectAdmin.vue';
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../admin/lang/${locale}.json`), 'systemAdmin']);
const dict = getDict(t);
const formatterDict = createformatterDictFn<SystemAdminInfo>(dict);
const { open } = useActionModel(AddOrUp);
const { open: openInfo } = useActionModel(Info);
const { open: openSelectAdmin } = useActionModel(SelectAdmin);
const params = reactive(new SystemAdminListParam());
const { loading, data, runAsync } = systemAdminListApi();
const searchText = ref('');
const { orgId } = defineProps<{
  orgId?: string;
}>();
const { runAsync: updateOrRunAsync } = updateSystemOrganizationApi();

const search = (page = params.page, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize, orgIds: orgId ? [orgId] : undefined, query: searchText.value || undefined }));
watch(
  () => orgId,
  () => {
    search(1);
  },
  { immediate: true },
);
const { runAsync: delRun, loading: delLoading } = delSystemAdminApi();
const delId = ref<string>();
const del = async (id: string) => {
  delId.value = id;
  await delRun(id);
  await search(1);
};
const showAddOrUp = (id?: string) => {
  open({
    id,
    onSuccess: async () => {
      await search(1);
    },
  });
};
const showInfo = (id?: string) => {
  openInfo({ id });
};
const showSelectAdmin = () => {
  if (!orgId) {
    ElMessage.error(t('请先选择组织'));
    return;
  }
  openSelectAdmin({
    selectedIds: data.value?.list?.map((item) => item.id) || [],
    onSuccess: async (checkedIds: string[]) => {
      await updateOrRunAsync(orgId, { adminIds: checkedIds });
      await search(1);
    },
  });
};
await Promise.all([loadRes]);
</script>
<style lang="scss" scoped>
.admin-list {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  .table-admin-list {
    height: 100%;
    display: flex;
    flex-direction: column;
    :deep(.me-vxe-body) {
      flex-grow: 1;
    }
  }
}
</style>
