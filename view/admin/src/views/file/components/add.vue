<template>
  <me-dialog v-model="show" :title="t('编辑')" :close-on-click-modal="false" @closed="emit('closed')">
    <div style="height: 300px;">
      <el-form-item :label="t('文件')">
        <me-upload v-model="files"></me-upload>
      </el-form-item>
    </div>

    <template #footer>
      <me-button @click="() => (show = false)">{{ t('关闭') }}</me-button>
    </template>
  </me-dialog>
</template>
<script setup lang="ts" name="AddFile">
import { FileInfo } from '@/api/file';
import { useLocalesI18n } from '@/locales/hooks';
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'file']);
await loadRes;
const show = defineModel<boolean>();
const emit = defineEmits<{
  (e: 'closed'): void;
}>();
const files = ref([] as FileInfo[]);
</script>
