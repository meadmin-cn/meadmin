<template>
  <page>
    <template #searchForm>
      <me-search-form :model="params" :default-all="true" class="search-form" @search="search(1)">
        <el-form-item :label="t('父级id')" prop="parentId">
          <el-input v-model="params.parentId" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('ID')" prop="id">
          <el-input v-model="params.id" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('角色名称')" prop="roleName">
          <el-input v-model="params.roleName" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('角色标识')" prop="roleKey">
          <el-input v-model="params.roleKey" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('排序(降序)')" prop="orderNum">
          <el-input-number v-model="params.orderNum" clearable></el-input-number>
        </el-form-item>
        <el-form-item :label="t('状态')" prop="status">
          <el-select v-model="params.status" clearable>
            <el-option v-for="val in dict.status" :key="val.value" :value="val.value" :label="val.label" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('备注')" prop="remark">
          <el-input v-model="params.remark" clearable></el-input>
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
      <vxe-column field="parentId" :title="t('父级id')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="id" :title="t('ID')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="roleName" :title="t('角色名称')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="roleKey" :title="t('角色标识')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="orderNum" :title="t('排序(降序)')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="status" :title="t('状态')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="remark" :title="t('备注')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="admins" :title="t('关联用户')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="menus" :title="t('具有权限菜单')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="createdAt" :title="t('创建时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column field="updatedAt" :title="t('最后更新时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column :title="t('操作')" fixed="right" min-width="150px">
        <template #default="{ row }: { row: SystemRoleInfo }">
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

<script setup lang="ts" name="SystemRole">
import { systemRoleListApi, SystemRoleListParam, delSystemRoleApi, SystemRoleInfo } from '@/api/system/role';
import { useLocalesI18n } from '@/locales/i18n';
import AddOrUp from './components/addOrUp.vue';
import { useActionModel } from '@/hooks/index.js';
import { formatterStr, formatterAt } from '@/utils/helper.js';
import { VxeColumnPropTypes } from 'vxe-table';
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
const { open } = useActionModel(AddOrUp);
let { t } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'systemRole']);
const params = reactive(new SystemRoleListParam());
const { loading, data, runAsync } = systemRoleListApi();
const search = (page = params.page, size = params.size) => runAsync(Object.assign(params, { page, size }));
const { runAsync: delRun, loading: delLoading } = delSystemRoleApi();
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
