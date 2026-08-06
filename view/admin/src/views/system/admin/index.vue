<template>
  <page>
    <template #searchForm>
      <me-search-form :model="params" :default-all="true" class="search-form" @search="search(1)">
        <el-form-item :label="t('ID')" prop="id">
          <el-input v-model="params.id" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('用户名')" prop="username">
          <el-input v-model="params.username"></el-input>
        </el-form-item>
        <el-form-item :label="t('昵称')" prop="nickname">
          <el-input v-model="params.nickname"></el-input>
        </el-form-item>
        <el-form-item :label="t('邮箱')" prop="email">
          <el-input v-model="params.email" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('手机号')" prop="mobile">
          <el-input v-model="params.mobile" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('最后登录时间')" prop="lastLoginAt">
          <el-date-picker v-model="params.startLastLoginAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" clearable />&nbsp; - &nbsp;
          <el-form-item prop="priceEnd">
            <el-date-picker v-model="params.endLastLoginAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" clearable />
          </el-form-item>
        </el-form-item>
        <el-form-item :label="t('最后登录ip')" prop="lastLoginIp">
          <el-input v-model="params.lastLoginIp" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('状态')" prop="status">
          <el-select v-model="params.status" clearable>
            <el-option v-for="val in dict.status" :key="val.value" :value="val.value" :label="val.label" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('组织')" prop="orgId">
          <el-tree-select v-model="params.orgIds" :data="orgTreeAllList || []" filterable multiple clearable check-strictly node-key="id" :props="{ label: 'orgName' }" :render-after-expand="false" />
        </el-form-item>
        <el-form-item :label="t('角色')" prop="roleIds">
          <el-tree-select v-model="params.roleIds" :data="roleTreeAllList || []" filterable multiple clearable check-strictly node-key="id" :props="{ label: 'roleName' }" :render-after-expand="false" />
        </el-form-item>
        <el-form-item :label="t('创建时间')" prop="createdAt">
          <el-date-picker v-model="params.startCreatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" clearable />&nbsp; - &nbsp;
          <el-form-item prop="priceEnd">
            <el-date-picker v-model="params.endCreatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" clearable />
          </el-form-item>
        </el-form-item>
        <el-form-item :label="t('最后更新时间')" prop="updatedAt">
          <el-date-picker v-model="params.startUpdatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" clearable />&nbsp; - &nbsp;
          <el-form-item prop="priceEnd">
            <el-date-picker v-model="params.endUpdatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" clearable />
          </el-form-item>
        </el-form-item>
      </me-search-form>
    </template>
    <me-vxe-table
      v-model:quick-search="params.query"
      align="center"
      border
      :loading="loading"
      :data="data?.list"
      :pagination-options="{
        currentPage: params.page,
        pageSize: params.pageSize,
        total: data?.total ?? 0,
        layout: 'sizes, prev, pager, next, jumper, ->, total',
        change: search,
      }"
      :quick-search-placeholder="t('输入用户名/昵称/手机号快捷查询')"
      :on-add="permission('system_admin_add') ? showAddOrUp : undefined"
      @refresh="search(1)"
      @quick-search="search(1)"
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
      <vxe-column field="lastLoginAt" :title="t('最后登录时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column field="status" :title="t('状态')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="roles" :title="t('具有的角色')" :formatter="formatterArrFn((obj) => obj.roleName)"></vxe-column>
      <vxe-column field="organizations" :title="t('所属组织')" :formatter="formatterArrFn((obj) => obj.orgName)"></vxe-column>
      <vxe-column field="createdAt" :title="t('创建时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column field="updatedAt" :title="t('最后更新时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column v-if="permission(['system_admin_info', 'system_admin_edit', 'system_admin_del'])" :title="t('操作')" fixed="right">
        <template #default="{ row }: { row: SystemAdminInfo }">
          <span>
            <me-button link :title="t('详情')" @click="showInfo(row.id)">
              <mel-icon-memo />
            </me-button>
            <me-button v-if="permission('system_admin_edit')" link :title="t('编辑')" @click="showAddOrUp(row.id)">
              <mel-icon-edit />
            </me-button>
            <el-popconfirm v-if="permission('system_admin_del')" :title="t('确认删除？')" placement="left" @confirm="del(row.id)">
              <template #reference>
                <me-button :key="row.id" :loading="delLoading && delId === row.id" type="danger" link :title="t('删除')">
                  <mel-icon-delete />
                </me-button>
              </template>
            </el-popconfirm>
          </span>
        </template>
      </vxe-column>
    </me-vxe-table>
  </page>
</template>

<script setup lang="ts" name="SystemAdmin">
import type { SystemAdminInfo } from '@/api/system/admin';
import { delSystemAdminApi, systemAdminListApi, SystemAdminListParam } from '@/api/system/admin';
import { systemOrganizationTreeAllApi } from '@/api/system/organization.js';
import { systemRoleTreeAllApi } from '@/api/system/role.js';
import { useActionModel } from '@/hooks/index.js';
import { useLocalesI18n } from '@/locales/i18n';
import { createformatterDictFn, formatterArrFn, formatterAt, formatterStr } from '@/utils/helper.js';
import { permission } from '@/utils/permission.js';
import AddOrUp from './components/addOrUp.vue';
import Info from './components/info.vue';
import { getDict } from './dict.js';
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'systemAdmin']);
const dict = getDict(t);
const formatterDict = createformatterDictFn<SystemAdminInfo>(dict);
const { data: orgTreeAllList, runAsync: getOrgTreeAllAsync } = systemOrganizationTreeAllApi();
const { data: roleTreeAllList, runAsync: getRoleTreeAllAsync } = systemRoleTreeAllApi();
const { open } = useActionModel(AddOrUp);
const { open: openInfo } = useActionModel(Info);
const params = reactive(new SystemAdminListParam());
const { loading, data, runAsync } = systemAdminListApi();
const search = (page = params.page, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize }));
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
await Promise.all([loadRes, search(1), getOrgTreeAllAsync(), getRoleTreeAllAsync()]);
</script>
<style lang="scss" scoped>
.view-img {
  width: 40px;
  height: 40px;
}
</style>
