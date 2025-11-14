<template>
  <me-dialog v-model="show" class="me-select-file-da0344ese" :title="t('选择文件')" :close-on-click-modal="false" @closed="emit('closed')">
    <me-vxe-table
      :loading="loading"
      :data="data?.list"
      :pagination-options="{
        currentPage: params.page,
        pageSize: params.pageSize,
        total: data?.total ?? 0,
        layout: 'sizes, prev, pager, next, jumper, ->, total',
        change: search,
      }"
      align="center"
      border
      v-model:quick-search="params.filename"
      @refresh="search(1)"
      @quick-search="search(1)"
      @add="() => {}"
    >
      <template #buttons>
        <div style="display: inline-block; margin-left: 12px; vertical-align: middle">
          <me-upload :show-file-list="false" @success="search(1)"></me-upload>
        </div>
      </template>
      <vxe-column field="name" :title="t('文件名')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="path" :title="t('路径')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="mimeType" :title="t('mime类型')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="size" :title="t('文件大小')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="storage" :title="t('存储引擎')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="createdAdmin" :title="t('创建者')" :formatter="formatterStr">
        <template #default="{ row }: { row: FileInfo }"> {{ row.createdAdmin.nickname }}({{ row.createdAdmin.username }}) </template>
      </vxe-column>
      <vxe-column field="createdAt" :title="t('创建时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column :title="t('操作')" fixed="right" min-width="150px">
        <template #default="{ row }: { row: FileInfo }">
          <el-button @click="select(row)"> <mel-icon-select  />{{ t('选择') }} </el-button>
        </template>
      </vxe-column>
    </me-vxe-table>
  </me-dialog>
</template>

<script setup lang="ts" name="MeSelectFile">
import { fileListApi, FileListParam, FileInfo } from '@/api/file';
import { useLocalesI18n } from '@/locales/i18n';
import { formatterStr, formatterAt } from '@/utils/helper.js';
const show = defineModel<boolean>('show');
const emit = defineEmits<{
  closed: [];
  selected: [FileInfo];
}>();
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`@/views/file/lang/${locale}.json`), 'file']);
const params = reactive(new FileListParam());
const { loading, data, runAsync } = fileListApi();
const search = (page = params.pageSize, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize }));
const select = (file: FileInfo) => {
  emit('selected', file);
  emit('closed');
};
await Promise.all([loadRes, search(1)]);
</script>
<style lang="scss">
.me-select-file-da0344ese {
  height: 60vh;
  width: 80vw;
}
</style>
