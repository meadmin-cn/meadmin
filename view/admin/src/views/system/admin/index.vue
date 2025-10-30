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
          <el-input v-model="params.lastLoginIp" clearable ></el-input>
        </el-form-item>
        <el-form-item :label="t('状态')" prop="status">
          <el-select v-model="params.status" clearable>
            <el-option v-for="val in dict.status" :key="val.value" :value="val.value" :label="val.label" />
          </el-select>
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
      :loading="loading"
      :data="data?.list"
      :pagination-options="{
        currentPage: params.page,
        pageSize: params.size,
        total: data?.total ?? 0,
        layout: 'sizes, prev, pager, next, jumper, ->, total',
        change: search,
      }"
      align="center"
      border
      @refresh="search(1)"
      @add="showAddOrUp()"
    >
      <vxe-column field="id" :title="t('ID')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="username" :title="t('用户名')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="nickname" :title="t('昵称')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="avatar" :title="t('头像')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="email" :title="t('邮箱')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="mobile" :title="t('手机号')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="loginFailure" :title="t('登录失败次数')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="lastLoginAt" :title="t('最后登录时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column field="lastLoginIp" :title="t('最后登录ip')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="status" :title="t('状态')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="roles" :title="t('具有的角色')" :formatter="({cellValue}:{cellValue:SystemRoleInfo[]})=>cellValue.map(item=>item.roleName).join(',')"></vxe-column>
      <vxe-column field="roleMenus" :title="t('具有权限的菜单')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="createdAt" :title="t('创建时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column field="updatedAt" :title="t('最后更新时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column :title="t('操作')" fixed="right" min-width="150px">
        <template #default="{ row }: { row: SystemAdminInfo }">
          <el-button @click="showAddOrUp(row.id)">
            <mel-icon-edit />
          </el-button>
          <el-popconfirm :title="t('确认删除？')" placement="left" @confirm="del(row.id)">
            <template #reference>
              <el-button :key="row.id" :loading="delLoading && delId === row.id" type="danger">
                <mel-icon-delete />
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </vxe-column>
    </me-vxe-table>
  </page>
</template>

<script setup lang="ts" name="SystemAdmin">
import { systemAdminListApi, SystemAdminListParam, delSystemAdminApi, SystemAdminInfo } from '@/api/system/admin';
import { useLocalesI18n } from '@/locales/i18n';
import AddOrUp from './components/addOrUp.vue';
import { useActionModel } from '@/hooks/index.js';
import { formatterStr, formatterAt } from '@/utils/helper.js';
import { VxeColumnPropTypes } from 'vxe-table';
import { SystemRoleInfo } from '@/api/system/role';
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'systemAdmin']);
const dict = {
  status: [
    { value: 1, label: t('启用') },
    { value: 0, label: t('禁用') },
  ],
};
const formatterDict: VxeColumnPropTypes.Formatter<SystemAdminInfo> = ({ cellValue, column }) => {
  //因为ts类型判定不得不断言dict
  return formatterStr({ cellValue: (dict as Record<string, { value: string | number; label: string }[]>)[column.field]?.find((item) => item.value == cellValue)?.label });
};
const { open } = useActionModel(AddOrUp);
const params = reactive(new SystemAdminListParam());
const { loading, data, runAsync } = systemAdminListApi();
const search = (page = params.page, size = params.size) => runAsync(Object.assign(params, { page, size }));
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
await Promise.all([loadRes, search(1)]);
</script>
