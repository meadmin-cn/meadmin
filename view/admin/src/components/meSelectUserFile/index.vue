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
      v-model:quick-search="params.name"
      @refresh="search(1)"
      @quick-search="search(1)"
      :onAdd="undefined"
    >
      <vxe-column field="id" :title="t('ID')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="name" :title="t('文件名')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="url" :title="t('预览')">
        <template #default="{ row }: { row: UserFileInfo }">
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
          <a class="el-link el-link--primary" v-else :href="row.url" target="_blank" :title="t('点击下载')">
            <mel-icon-download size="20px"></mel-icon-download>
          </a>
        </template>
      </vxe-column>
      <vxe-column field="path" :title="t('路径')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="mimeType" :title="t('mime类型')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="size" :title="t('文件大小')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="storage" :title="t('存储引擎')" :formatter="formatterStr"></vxe-column>
      <vxe-column field="createdAdmin" :title="t('创建者(用户)')">
        <template #default="{ row }: { row: UserFileInfo }">
          <template v-if="row.createdUser"> {{ row.createdUser.nickname }}({{ row.createdUser.username }}) </template>
          <template v-else> -- </template>
        </template>
      </vxe-column>
      <vxe-column field="createdAdmin" :title="t('创建者(管理员)')">
        <template #default="{ row }: { row: UserFileInfo }">
          <template v-if="row.createdAdmin"> {{ row.createdAdmin.nickname }}({{ row.createdAdmin.username }}) </template>
          <template v-else> -- </template>
        </template>
      </vxe-column>
      <vxe-column field="createdAt" :title="t('创建时间')" :formatter="formatterAt"></vxe-column>
      <vxe-column :title="t('操作')" fixed="right">
        <template #default="{ row }: { row: UserFileInfo }">
          <el-button @click="select(row)"> <mel-icon-select />{{ t('选择') }} </el-button>
        </template>
      </vxe-column>
    </me-vxe-table>
  </me-dialog>
</template>

<script setup lang="ts" name="MeSelectFile">
import { UserFileInfo, userFileListApi, UserFileListParam } from '@/api/userFile';
import { useLocalesI18n } from '@/locales/i18n';
import { isImage } from '@/utils/helper';
import { formatterAt, formatterStr } from '@/utils/helper.js';
const show = defineModel<boolean>('show');
const emit = defineEmits<{
  closed: [];
  selected: [UserFileInfo];
}>();
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`@/views/file/lang/${locale}.json`), 'file']);
const params = reactive(new UserFileListParam());
const { loading, data, runAsync } = userFileListApi();
const search = (page = params.pageSize, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize }));
const select = (file: UserFileInfo) => {
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
