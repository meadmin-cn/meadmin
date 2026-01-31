<template>
  <me-dialog v-model="show" class="me-select-file-da0344ese" :title="t('选择文件')" :close-on-click-modal="false" @closed="emit('closed')">
    <me-vxe-table
      v-model:quick-search="params.name"
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
      :on-add="undefined"
      @refresh="search(1)"
      @quick-search="search(1)"
    >
      <vxe-column field="id" :title="t('ID')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="name" :title="t('文件名')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="url" :title="t('预览')">
        <template #default="{ row }: { row: FileInfo }">
          <el-image
            v-if="isImage(row.url)"
            class="view-img"
            :src="row.url"
            :zoom-rate="1.2"
            :max-scale="7"
            :min-scale="0.2"
            :preview-src-list="[row.url]"
            show-progress
            preview-teleported
            fit="scale-down"
          />
          <a v-else class="el-link el-link--primary" :href="row.url" target="_blank" :title="t('点击下载')">
            <mel-icon-download size="20px"></mel-icon-download>
          </a>
        </template>
      </vxe-column>
      <vxe-column field="path" :title="t('路径')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="mimeType" :title="t('mime类型')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="size" :title="t('文件大小')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="storage" :title="t('存储引擎')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="createdAdmin" :title="t('创建者')" :formatter="formatterStr">
        <template #default="{ row }: { row: FileInfo }"> {{ row.createdAdmin.nickname }}({{ row.createdAdmin.username }}) </template>
      </vxe-column>
      <vxe-column field="createdAt" :title="t('创建时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column :title="t('操作')" fixed="right">
        <template #default="{ row }: { row: FileInfo }">
          <el-button @click="select(row)"> <mel-icon-select />{{ t('选择') }} </el-button>
        </template>
      </vxe-column>
    </me-vxe-table>
  </me-dialog>
</template>

<script setup lang="ts" name="MeSelectFile">
import { FileInfo, FileListParam, fileMyListApi } from '@/api/file';
import { useLocalesI18n } from '@/locales/i18n';
import { isImage } from '@/utils/helper';
import { formatterAt, formatterStr } from '@/utils/helper.js';
const show = defineModel<boolean>('show');
const emit = defineEmits<{
  closed: [];
  selected: [FileInfo];
}>();
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`@/views/file/lang/${locale}.json`), 'file']);
const params = reactive(new FileListParam());
const { loading, data, runAsync } = fileMyListApi();
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
  .view-img {
    width: 50px;
    height: 50px;
  }
}
</style>
