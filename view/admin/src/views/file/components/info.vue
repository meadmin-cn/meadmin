<template>
  <me-dialog v-model="show" :title="t('详情')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-descriptions v-loading="loading" class="info" :border="true">
      <el-descriptions-item :label="t('ID')"> {{ formatterStrExec(data?.id) }} </el-descriptions-item>
      <el-descriptions-item :label="t('文件名')" :span="2"> {{ formatterStrExec(data?.name) }} </el-descriptions-item>
      <el-descriptions-item :label="t('mime类型')"> {{ formatterStrExec(data?.mimeType) }} </el-descriptions-item>
      <el-descriptions-item :label="t('路径')" :span="2"> {{ formatterStrExec(data?.path) }} </el-descriptions-item>
      <el-descriptions-item :label="t('文件大小')"> {{ formatterStrExec(data?.size) }} </el-descriptions-item>
      <el-descriptions-item :label="t('存储引擎')"> {{ formatterStrExec(data?.storage) }} </el-descriptions-item>
      <el-descriptions-item :label="t('预览')" :span="2">
        <me-files-view :files="data ? [data] : []"></me-files-view>
      </el-descriptions-item>
      <el-descriptions-item :label="t('创建时间')"> {{ formatterAtExec(data?.createdAt) }} </el-descriptions-item>
      <el-descriptions-item :label="t('最后更新时间')"> {{ formatterAtExec(data?.updatedAt) }} </el-descriptions-item>
      <el-descriptions-item :label="t('创建者')"> {{ formatterObjectExecFn((obj) => `${obj.nickname}(${obj.username})`)(data?.createdAdmin) }} </el-descriptions-item>
      <el-descriptions-item :label="t('最后更新者')"> {{ formatterObjectExecFn((obj) => `${obj.nickname}(${obj.username})`)(data?.updatedAdmin) }} </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <me-button @click="() => (show = false)">{{ t('关闭') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="Info">
import { fileInfoApi } from '@/api/file.js';
import { useLocalesI18n } from '@/locales/hooks.js';
import { formatterAtExec, formatterObjectExecFn, formatterStrExec } from '@/utils/helper.js';
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'exampleDemo']);
await loadRes;
const show = defineModel<boolean>();
const props = defineProps<{
  id?: string;
}>();
const emit = defineEmits<{
  (e: 'closed'): void;
}>();
const { data, loading, runAsync } = fileInfoApi();
watch(
  () => props.id,
  async (id?: string) => {
    if (id) {
      runAsync(id);
    }
  },
  { immediate: true },
);
</script>
<style lang="scss" scoped>
.info {
}
</style>
