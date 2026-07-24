<template>
  <me-dialog v-model="show" v-loading="loading" :title="t('详情')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-descriptions class="info" :border="true">
      <el-descriptions-item :label="t('父级id')"> {{ formatterStrExec(data?.parentId) }} </el-descriptions-item>
      <el-descriptions-item :label="t('ID')"> {{ formatterStrExec(data?.id) }} </el-descriptions-item>
      <el-descriptions-item :label="t('父级')"> {{ formatterStrExec(data?.parent) }} </el-descriptions-item>
      <el-descriptions-item :label="t('组织名称')"> {{ formatterStrExec(data?.orgName) }} </el-descriptions-item>
      <el-descriptions-item :label="t('排序(降序)')"> {{ formatterStrExec(data?.orderNum) }} </el-descriptions-item>
      <el-descriptions-item :label="t('状态')"> {{ formatterDictExec(dict, 'status', data?.status) }} </el-descriptions-item>
      <el-descriptions-item :label="t('备注')"> {{ formatterStrExec(data?.remark) }} </el-descriptions-item>
      <el-descriptions-item :label="t('负责人')"> {{ formatterStrExec(data?.leader) }} </el-descriptions-item>
      <el-descriptions-item :label="t('联系电话')"> {{ formatterStrExec(data?.phone) }} </el-descriptions-item>
      <el-descriptions-item :label="t('邮箱')"> {{ formatterStrExec(data?.email) }} </el-descriptions-item>
      <el-descriptions-item :label="t('关联管理员')"> {{ formatterArrExecFn('username')(data?.admins) }} </el-descriptions-item>
      <el-descriptions-item :label="t('创建时间')"> {{ formatterAtExec(data?.createdAt) }} </el-descriptions-item>
      <el-descriptions-item :label="t('最后更新时间')"> {{ formatterAtExec(data?.updatedAt) }} </el-descriptions-item>
      <el-descriptions-item :label="t('创建者(管理员)')"> {{ formatterObjectExecFn((obj) => `${obj.nickname}(${obj.username})`)(data?.createdAdmin) }} </el-descriptions-item>
      <el-descriptions-item :label="t('最后更新者(管理员)')"> {{ formatterObjectExecFn((obj) => `${obj.nickname}(${obj.username})`)(data?.updatedAdmin) }} </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <me-button @click="() => (show = false)">{{ t('关闭') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="Info">
import { systemOrganizationInfoApi } from '@/api/system/organization';
import { useLocalesI18n } from '@/locales/hooks.js';
import { formatterArrExecFn, formatterAtExec, formatterDictExec, formatterObjectExecFn, formatterStrExec } from '@/utils/helper.js';
import { getDict } from '../dict.js';
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'systemOrganization']);
await loadRes;
const dict = getDict(t);
const show = defineModel<boolean>();
const props = defineProps<{
  id?: string;
}>();
const emit = defineEmits<{
  (e: 'closed'): void;
}>();
const { data, loading, runAsync } = systemOrganizationInfoApi();
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
