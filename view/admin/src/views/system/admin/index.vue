<template>
  <page>
    <me-search-form :model="params" :default-all="true" class="search-form" @search="search(1)" #searchForm>
      <el-form-item :label="t('ID')" prop="id">
        <el-input v-model="params.id"></el-input>
      </el-form-item>
      <el-form-item :label="t('用户名')" prop="username">
        <el-input v-model="params.username"></el-input>
      </el-form-item>
      <el-form-item :label="t('昵称')" prop="nickname">
        <el-input v-model="params.nickname"></el-input>
      </el-form-item>
      <el-form-item :label="t('密码')" prop="password">
        <el-input v-model="params.password"></el-input>
      </el-form-item>
      <el-form-item :label="t('头像')" prop="avatar">
        <el-input v-model="params.avatar"></el-input>
      </el-form-item>
      <el-form-item :label="t('邮箱')" prop="email">
        <el-input v-model="params.email"></el-input>
      </el-form-item>
      <el-form-item :label="t('手机号')" prop="mobile">
        <el-input v-model="params.mobile"></el-input>
      </el-form-item>
      <el-form-item :label="t('登录失败次数')" prop="loginFailure">
        <el-input-number v-model="params.loginFailure"></el-input-number>
      </el-form-item>
      <el-form-item :label="t('最后登录时间')" prop="lastLoginAt">
        <el-date-picker v-model="params.startLastLoginAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" />&nbsp; - &nbsp;
        <el-form-item prop="priceEnd">
          <el-date-picker v-model="params.endLastLoginAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
      </el-form-item>
      <el-form-item :label="t('最后登录ip')" prop="lastLoginIp">
        <el-input v-model="params.lastLoginIp"></el-input>
      </el-form-item>
      <el-form-item :label="t('状态')" prop="status">
        <el-select v-model="params.status">
          <el-option v-for="val in dict.status" :key="val.value" :value="val.value">{{ val.label }}</el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="t('超级管理员')" prop="isSuper">
        <el-select v-model="params.isSuper">
          <el-option v-for="val in dict.isSuper" :key="val.value" :value="val.value">{{ val.label }}</el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="t('创建时间')" prop="createdAt">
        <el-date-picker v-model="params.startCreatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" />&nbsp; - &nbsp;
        <el-form-item prop="priceEnd">
          <el-date-picker v-model="params.endCreatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
      </el-form-item>
      <el-form-item :label="t('最后更新时间')" prop="updatedAt">
        <el-date-picker v-model="params.startUpdatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" />&nbsp; - &nbsp;
        <el-form-item prop="priceEnd">
          <el-date-picker v-model="params.endUpdatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
      </el-form-item>
    </me-search-form>
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
      <vxe-column field="id" :title="t('keyInfo.name')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="username" :title="t('keyInfo.name')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="nickname" :title="t('keyInfo.name')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="password" :title="t('keyInfo.name')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="avatar" :title="t('keyInfo.name')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="email" :title="t('keyInfo.name')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="mobile" :title="t('keyInfo.name')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="loginFailure" :title="t('keyInfo.name')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="lastLoginAt" :title="t('keyInfo.name')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="lastLoginIp" :title="t('keyInfo.name')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="status" :title="t('keyInfo.name')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="isSuper" :title="t('keyInfo.name')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="roles" :title="t('keyInfo.name')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="roleMenus" :title="t('keyInfo.name')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="createdAt" :title="t('keyInfo.name')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="updatedAt" :title="t('keyInfo.name')" :formatter="formatterDict"></vxe-column>
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
import { formatterStr } from '@/utils/helper.js';
import { VxeColumnPropTypes } from 'vxe-table';
const dict = {
  status: {
    '0': { value: 0, label: '禁用' },
    '1': { value: 1, label: '启用' },
  },
  isSuper: {
    '0': { value: 0, label: '不是' },
    '1': { value: 1, label: '是' },
  },
};
const formatterDict: VxeColumnPropTypes.Formatter<SystemAdminInfo> = ({ cellValue, column }) => {
  //因为ts类型判定不得不断言dict
  return formatterStr({ cellValue: (dict as Record<string, any>)[column.field]?.[cellValue as string]?.label });
};
const { open } = useActionModel(AddOrUp);
let { t } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'systemAdmin']);
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
await search(1);
</script>
