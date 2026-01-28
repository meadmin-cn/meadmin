<template>
  <me-dialog v-model="show" :title="t('详情')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-descriptions v-loading="loading" class="info" :border="true">
      <el-descriptions-item :label="t('ID')"> {{ formatterStrExec(data?.id) }} </el-descriptions-item>
      <el-descriptions-item :label="t('手机号')"> {{ formatterStrExec(data?.mobile) }} </el-descriptions-item>
      <el-descriptions-item :label="t('类型')"> {{ formatterDictExec(dict, 'type', data?.type) }} </el-descriptions-item>
      <el-descriptions-item :label="t('名称')"> {{ formatterStrExec(data?.name) }} </el-descriptions-item>
      <el-descriptions-item :label="t('书籍')"> {{ formatterArrExecFn('name')(data?.books) }} </el-descriptions-item>
      <el-descriptions-item :label="t('用户')"> {{ formatterObjectExecFn('username')(data?.user) }} </el-descriptions-item>
      <el-descriptions-item :label="t('头像')">
        <me-files-view :files="data?.avatar ? [data.avatar] : []"></me-files-view>
      </el-descriptions-item>
      <el-descriptions-item :label="t('附件')">
        <me-files-view :files="data?.files ?? []"></me-files-view>
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
import { exampleDemoInfoApi } from '@/api/example/demo';
import { useLocalesI18n } from '@/locales/hooks.js';
import { formatterArrExecFn, formatterAtExec, formatterDictExec, formatterObjectExecFn, formatterStrExec } from '@/utils/helper.js';
import { getDict } from '../dict.js';
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'exampleDemo']);
await loadRes;
const dict = getDict(t);
const show = defineModel<boolean>();
const props = defineProps<{
  id?: string;
}>();
const emit = defineEmits<{
  (e: 'closed'): void;
}>();
const { data, loading, runAsync } = exampleDemoInfoApi();
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
