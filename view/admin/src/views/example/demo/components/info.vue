<template>
  <me-dialog v-model="show" :title="t('详情')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-descriptions class="info" :border="true" v-loading="loading"> </el-descriptions>
    <template #footer>
      <me-button @click="() => (show = false)">{{ t('关闭') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="Info">
import { exampleDemoInfoApi } from '@/api/example/demo';
import { useLocalesI18n } from '@/locales/hooks.js';
import { formatterAtExec, , formatterStrExec } from '@/utils/helper.js';
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'exampleDemo']);
await loadRes;
import { getDict } from '../dict.js';
import {formatterDictExec} from '@/utils/helper.js';
const dict = getDict(t);
const show = defineModel<boolean>();
const props = defineProps<{

  id?: string;

}>();
const emit = defineEmits<{
  (e: 'closed'): void;
}>();
const { data, loading, runAsync } = exampleDemoInfoApi({ noLoading: true });
watch(
  () => props.id,
  async (id?:string) => {
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
