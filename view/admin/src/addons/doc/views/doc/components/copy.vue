<template>
  <me-dialog v-model="show" :title="t('复制')" :close-on-click-modal="false" @closed="emit('closed')">
    <div style="display: flex; align-items: center">
      {{ t('从') }}&nbsp;<el-select v-model="params.fromVersion">
        <el-option v-for="val in dict.version" :key="val.value" :value="val.value" :label="val.label" />
      </el-select>
      <div style="flex-shrink: 0">&nbsp;{{ t('复制到') }}&nbsp;</div>
      <el-select v-model="params.toVersion">
        <el-option v-for="val in dict.version" :key="val.value" :value="val.value" :label="val.label" />
      </el-select>
    </div>

    <template #footer>
      <me-button @click="() => (show = false)">{{ t('取消') }}</me-button>
      <me-button type="primary" @click="submit()">{{ t('提交') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="Copy">
import { copyAonDocApi, CopyAonDocParams } from '@/addons/doc/api/doc.js';
import { useLocalesI18n } from '@/locales/hooks.js';
import { getDict } from '../dict.js';
const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'closed'): void;
}>();
const { runAsync } = copyAonDocApi();

let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'aonDoc']);
await Promise.all([loadRes]);
const dict = await getDict(t);
const show = defineModel<boolean>();
const params = reactive(new CopyAonDocParams());
const submit = async () => {
  if (!params.fromVersion) {
    return ElMessage.error(t('来源版本不能为空'));
  }
  if (!params.toVersion) {
    return ElMessage.error(t('目标版本不能为空'));
  }
  await runAsync(params);
  show.value = false;
  emit('success');
};
</script>
<style lang="scss" scoped>
.copy {
}
</style>
