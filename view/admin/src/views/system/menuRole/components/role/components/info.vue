<template>
  <me-dialog v-model="show" :title="t('详情')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-descriptions v-loading="loading" class="info" :border="true">
      <el-descriptions-item :label="t('ID')">{{ formatterStrExec(data?.id) }}</el-descriptions-item>
      <el-descriptions-item :label="t('父级')">{{ formatterStrExec(data?.parent?.roleName) }}</el-descriptions-item>
      <el-descriptions-item :label="t('角色名称')">{{ formatterStrExec(data?.roleName) }}</el-descriptions-item>
      <el-descriptions-item :label="t('角色标识')">{{ formatterStrExec(data?.roleKey) }}</el-descriptions-item>
      <el-descriptions-item :label="t('排序(降序)')">{{ formatterStrExec(data?.orderNum) }}</el-descriptions-item>
      <el-descriptions-item :label="t('状态')">{{ formatterDictExec(dict, 'status', data?.status) }}</el-descriptions-item>
      <el-descriptions-item :label="t('备注')">{{ formatterStrExec(data?.remark) }}</el-descriptions-item>
      <el-descriptions-item :label="t('创建时间')">
        {{ formatterAtExec(data?.createdAt) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('最后更新时间')">
        {{ formatterAtExec(data?.updatedAt) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('创建人')"> {{ formatterStrExec(data?.createdAdmin?.nickname) }}({{ formatterStrExec(data?.createdAdmin?.username) }}) </el-descriptions-item>
      <el-descriptions-item :label="t('最后更新人')"> {{ formatterStrExec(data?.updatedAdmin?.nickname) }}({{ formatterStrExec(data?.updatedAdmin?.username) }}) </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <me-button @click="() => (show = false)">{{ t('关闭') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="Info">
import { systemRoleInfoApi } from '@/api/system/role.js';
import { useLocalesI18n } from '@/locales/hooks.js';
import { formatterAtExec, formatterDictExec, formatterStrExec } from '@/utils/helper.js';
import { getDict } from '../dict.js';
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'systemAdmin']);
await loadRes;
const dict = getDict(t);
const show = defineModel<boolean>();
const props = defineProps<{
  id?: string;
}>();
const emit = defineEmits<{
  (e: 'closed'): void;
}>();
const { data, loading, runAsync } = systemRoleInfoApi();
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
  .view-img {
    width: 80px;
    height: 80px;
  }
}
</style>
