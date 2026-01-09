<template>
  <page>
    <template #searchForm>
      <me-search-form :model="params" :default-all="true" class="search-form" @search="search(1)">
        <el-form-item :label="t('ID')" prop="id">
          <el-input v-model="params.id" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('文件名')" prop="name">
          <el-input v-model="params.name" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('路径')" prop="path">
          <el-input v-model="params.path" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('mime类型')" prop="mimeType">
          <el-input v-model="params.mimeType" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('文件大小')" prop="size">
          <el-input-number v-model="params.size" clearable></el-input-number>
        </el-form-item>
        <el-form-item :label="t('存储引擎')" prop="storage">
          <el-input v-model="params.storage" clearable></el-input>
        </el-form-item>
        <el-form-item :label="t('创建时间')" prop="createdAt">
          <el-date-picker v-model="params.startCreatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
            clearable />&nbsp; - &nbsp;
          <el-form-item prop="priceEnd">
            <el-date-picker v-model="params.endCreatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
              clearable />
          </el-form-item>
        </el-form-item>
        <el-form-item :label="t('最后更新时间')" prop="updatedAt">
          <el-date-picker v-model="params.startUpdatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
            clearable />&nbsp; - &nbsp;
          <el-form-item prop="priceEnd">
            <el-date-picker v-model="params.endUpdatedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
              clearable />
          </el-form-item>
        </el-form-item>
      </me-search-form>
    </template>
    <me-vxe-table :loading="loading" :data="data?.list" :pagination-options="{
      currentPage: params.page,
      pageSize: params.pageSize,
      total: data?.total ?? 0,
      layout: 'sizes, prev, pager, next, jumper, ->, total',
      change: search,
    }" align="center" border @refresh="search(1)" @add="showAdd()">
      <vxe-column field="id" :title="t('ID')" :formatter="formatterStr"></vxe-column>
      <vxe-column :title="t('预览')">
         <template #default="{ row }: { row: FileInfo }">
          <me-files-view :files=" [row]"></me-files-view>
         </template>
      </vxe-column>
      <vxe-column field="name" :title="t('文件名')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="path" :title="t('路径')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="mimeType" :title="t('mime类型')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="size" :title="t('文件大小')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="storage" :title="t('存储引擎')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="createdAdmin" :title="t('创建者')" :formatter="formatterStr">
        <template #default="{ row }: { row: FileInfo }">
          {{ row.createdAdmin.nickname }}({{ row.createdAdmin.username }})
        </template>
      </vxe-column>
      <vxe-column field="createdAt" :title="t('创建时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column :title="t('操作')" v-if="permission(['file_info', 'file_edit', 'file_del'])" fixed="right" min-width="150px">
        <template #default="{ row }: { row: FileInfo }">
          <me-button v-if="permission('example_demo_info')" @click="showInfo(row.id)" link :title="t('详情')">
            <mel-icon-memo />
          </me-button>
          <el-button v-if="permission('file_edit')" @click="showUp(row.id)" link :title="t('编辑')">
            <mel-icon-edit />
          </el-button>
          <el-popconfirm v-if="permission('file_del')" :title="t('确认删除？')" placement="left" @confirm="del(row.id)">
            <template #reference>
              <el-button :key="row.id" link :loading="delLoading && delId === row.id"  :title="t('删除')" type="danger">
                <mel-icon-delete />
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </vxe-column>
    </me-vxe-table>
  </page>
</template>

<script setup lang="ts" name="File">
import { fileListApi, FileListParam, delFileApi, FileInfo } from '@/api/file';
import { useLocalesI18n } from '@/locales/i18n';
import Up from './components/up.vue';
import { useActionModel } from '@/hooks/index.js';
import { formatterStr, formatterAt } from '@/utils/helper.js';
import { permission } from '@/utils/permission.js';
import Add from './components/add.vue';
import Info from './components/info.vue';

const { open: openUp } = useActionModel(Up);
const { open: openAdd } = useActionModel(Add);
const { open: openInfo } = useActionModel(Info);
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'file']);
const params = reactive(new FileListParam());
const { loading, data, runAsync } = fileListApi();
const search = (page = params.pageSize, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize }));
const { runAsync: delRun, loading: delLoading } = delFileApi();
const delId = ref<string>();
const del = async (id: string) => {
  delId.value = id;
  await delRun(id);
  await search(1);
};
const showAdd = () => {
  openAdd({
    onClosed: async () => {
      await search(1);
    }
  })
}
const showUp = (id: string) => {
  openUp({
    id,
    onSuccess: async () => {
      await search(1);
    },
  });
};
const showInfo = (id: string)=>{
  openInfo({
    id
  });
} 
await Promise.all([loadRes, search(1)]);
</script>
