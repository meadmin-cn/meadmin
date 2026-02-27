<template>
  <me-dialog v-model="show" :title="t('详情')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-descriptions v-loading="loading" class="info" :border="true">
      <el-descriptions-item :label="t('父级id')">
        {{ formatterStrExec(data?.parentId) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('ID')">
        {{ formatterStrExec(data?.id) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('名称')">
        {{ formatterStrExec(data?.title) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('图标(200*200)')">
        <me-files-view :files="data?.icon ? [data.icon] : []"></me-files-view>
      </el-descriptions-item>
      <el-descriptions-item :label="t('父级')">
        {{ formatterStrExec(data?.parent) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('类型')">
        {{ formatterDictExec(dict, 'type', data?.type) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('状态')">
        {{ formatterDictExec(dict, 'status', data?.status) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('排序(降序)')">
        {{ formatterStrExec(data?.orderNum) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('内容类型')">
        {{ formatterDictExec(dict, 'constentType', data?.constentType) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('内容')">
        {{ formatterStrExec(data?.mdContent) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('外链地址')">
        {{ formatterStrExec(data?.link) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('创建时间')">
        {{ formatterAtExec(data?.createdAt) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('最后更新时间')">
        {{ formatterAtExec(data?.updatedAt) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('创建者(管理员)')">
        {{ formatterObjectExecFn((obj) => `${obj.nickname}(${obj.username})`)(data?.createdAdmin) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('最后更新者(管理员)')">
        {{ formatterObjectExecFn((obj) => `${obj.nickname}(${obj.username})`)(data?.updatedAdmin) }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <me-button @click="() => (show = false)">{{ t('关闭') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="Info">
import { aonDocInfoApi } from '@/addons/doc/api/aonDoc';
import { useLocalesI18n } from '@/locales/hooks.js';
import { formatterAtExec, formatterDictExec, formatterObjectExecFn, formatterStrExec } from '@/utils/helper.js';
import { getDict } from '../dict.js';
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'aonDoc']);
await loadRes;
const dict = getDict(t);
const show = defineModel<boolean>();
const props = defineProps<{
  id?: string;
}>();
const emit = defineEmits<{
  (e: 'closed'): void;
}>();
const { data, loading, runAsync } = aonDocInfoApi();
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
