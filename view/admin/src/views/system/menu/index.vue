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
        <el-form-item :label="t('菜单名称')" prop="title">
          <el-input v-model="params.title" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('类型')" prop="menuType">
          <el-select v-model="params.menuType" clearable>
            <el-option v-for="val in dict.menuType" :key="val.value" :value="val.value" :label="val.label" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('状态')" prop="status">
          <el-select v-model="params.status" clearable>
            <el-option v-for="val in dict.status" :key="val.value" :value="val.value" :label="val.label" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('权限')" prop="rule">
          <el-input v-model="params.rule" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('排序(降序)')" prop="orderNum">
          <el-input-number v-model="params.orderNum" clearable></el-input-number>
        </el-form-item>
        <el-form-item :label="t('路径')" prop="path">
          <el-input v-model="params.path" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('外链')" prop="isLink">
          <el-select v-model="params.isLink" clearable>
            <el-option v-for="val in dict.isLink" :key="val.value" :value="val.value" :label="val.label" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('组件路径(相对于views文件夹)')" prop="component">
          <el-input v-model="params.component" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('隐藏')" prop="hideMenu">
          <el-select v-model="params.hideMenu" clearable>
            <el-option v-for="val in dict.hideMenu" :key="val.value" :value="val.value" :label="val.label" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('缓存')" prop="cache">
          <el-select v-model="params.cache" clearable>
            <el-option v-for="val in dict.cache" :key="val.value" :value="val.value" :label="val.label" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('图标')" prop="icon">
          <el-input v-model="params.icon" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('固定tag')" prop="affix">
          <el-select v-model="params.affix" clearable>
            <el-option v-for="val in dict.affix" :key="val.value" :value="val.value" :label="val.label" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('恒定展示(只有一个子元素时不隐藏)')" prop="alwaysShow">
          <el-select v-model="params.alwaysShow" clearable>
            <el-option v-for="val in dict.alwaysShow" :key="val.value" :value="val.value" :label="val.label" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('面包屑')" prop="breadcrumb">
          <el-select v-model="params.breadcrumb" clearable>
            <el-option v-for="val in dict.breadcrumb" :key="val.value" :value="val.value" :label="val.label" />
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
      <vxe-column field="parentId" :title="t('父级id')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="id" :title="t('ID')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="title" :title="t('菜单名称')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="menuType" :title="t('类型')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="status" :title="t('状态')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="rule" :title="t('权限')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="orderNum" :title="t('排序(降序)')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="path" :title="t('路径')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="isLink" :title="t('外链')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="component" :title="t('组件路径(相对于views文件夹)')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="hideMenu" :title="t('隐藏')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="cache" :title="t('缓存')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="icon" :title="t('图标')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="affix" :title="t('固定tag')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="alwaysShow" :title="t('恒定展示(只有一个子元素时不隐藏)')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="breadcrumb" :title="t('面包屑')" :formatter="formatterDict"></vxe-column>
      <vxe-column field="createdAt" :title="t('创建时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column field="updatedAt" :title="t('最后更新时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column :title="t('操作')" fixed="right" min-width="150px">
        <template #default="{ row }: { row: SystemMenuInfo }">
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

<script setup lang="ts" name="SystemMenu">
import { systemMenuListApi, SystemMenuListParam, delSystemMenuApi, SystemMenuInfo } from '@/api/system/menu';
import { useLocalesI18n } from '@/locales/i18n';
import AddOrUp from './components/addOrUp.vue';
import { useActionModel } from '@/hooks/index.js';
import { formatterStr, formatterAt } from '@/utils/helper.js';
import { VxeColumnPropTypes } from 'vxe-table';
const dict = {
  menuType: [
    { value: 1, label: '目录' },
    { value: 2, label: '菜单' },
    { value: 3, label: '按钮' },
  ],
  status: [
    { value: 1, label: '启用' },
    { value: 0, label: '禁用' },
  ],
  isLink: [
    { value: 1, label: '是' },
    { value: 0, label: '否' },
  ],
  hideMenu: [
    { value: 1, label: '是' },
    { value: 0, label: '否' },
  ],
  cache: [
    { value: 1, label: '是' },
    { value: 0, label: '否' },
  ],
  affix: [
    { value: 1, label: '是' },
    { value: 0, label: '否' },
  ],
  alwaysShow: [
    { value: 1, label: '是' },
    { value: 0, label: '否' },
  ],
  breadcrumb: [
    { value: 1, label: '展示' },
    { value: 0, label: '不展示' },
  ],
};
const formatterDict: VxeColumnPropTypes.Formatter<SystemMenuInfo> = ({ cellValue, column }) => {
  //因为ts类型判定不得不断言dict
  return formatterStr({ cellValue: (dict as Record<string, { value: string | number; label: string }[]>)[column.field]?.find((item) => item.value == cellValue)?.label });
};
const { open } = useActionModel(AddOrUp);
let { t } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'systemMenu']);
const params = reactive(new SystemMenuListParam());
const { loading, data, runAsync } = systemMenuListApi();
const search = (page = params.page, size = params.size) => runAsync(Object.assign(params, { page, size }));
const { runAsync: delRun, loading: delLoading } = delSystemMenuApi();
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
