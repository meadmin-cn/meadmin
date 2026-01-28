<template>
  <me-dialog v-model="show" :title="t('详情')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-descriptions v-loading="loading" class="info" :border="true">
      <el-descriptions-item :label="t('ID')"> {{ formatterStrExec(data?.id) }} </el-descriptions-item>
      <el-descriptions-item :label="t('用户名')"> {{ formatterStrExec(data?.username) }} </el-descriptions-item>
      <el-descriptions-item :label="t('昵称')"> {{ formatterStrExec(data?.nickname) }} </el-descriptions-item>
      <el-descriptions-item :label="t('密码')"> {{ formatterStrExec(data?.password) }} </el-descriptions-item>
      <el-descriptions-item :label="t('头像')"> {{ formatterObjectExecFn('name')(data?.avatar) }} </el-descriptions-item>
      <el-descriptions-item :label="t('邮箱')"> {{ formatterStrExec(data?.email) }} </el-descriptions-item>
      <el-descriptions-item :label="t('手机号')"> {{ formatterStrExec(data?.mobile) }} </el-descriptions-item>
      <el-descriptions-item :label="t('登录失败次数')"> {{ formatterStrExec(data?.loginFailure) }} </el-descriptions-item>
      <el-descriptions-item :label="t('最后登录时间')"> {{ formatterAtExec(data?.lastLoginAt) }} </el-descriptions-item>
      <el-descriptions-item :label="t('最后登录ip')"> {{ formatterStrExec(data?.lastLoginIp) }} </el-descriptions-item>
      <el-descriptions-item :label="t('状态')"> {{ formatterDictExec(dict, 'status', data?.status) }} </el-descriptions-item>
      <el-descriptions-item :label="t('创建者Id')"> {{ formatterStrExec(data?.createdUserId) }} </el-descriptions-item>
      <el-descriptions-item :label="t('创建者')"> {{ formatterStrExec(data?.createdUser) }} </el-descriptions-item>
      <el-descriptions-item :label="t('最后更新者')"> {{ formatterStrExec(data?.updatedUser) }} </el-descriptions-item>
      <el-descriptions-item :label="t('创建时间')"> {{ formatterAtExec(data?.createdAt) }} </el-descriptions-item>
      <el-descriptions-item :label="t('最后更新时间')"> {{ formatterAtExec(data?.updatedAt) }} </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <me-button @click="() => (show = false)">{{ t('关闭') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="Info">
import { userInfoApi } from '@/api/user';
import { useLocalesI18n } from '@/locales/hooks.js';
import { formatterAtExec, formatterDictExec, formatterObjectExecFn, formatterStrExec } from '@/utils/helper.js';
import { getDict } from '../dict.js';
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'user']);
await loadRes;
const dict = getDict(t);
const show = defineModel<boolean>();
const props = defineProps<{
  id?: string;
}>();
const emit = defineEmits<{
  (e: 'closed'): void;
}>();
const { data, loading, runAsync } = userInfoApi();
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
