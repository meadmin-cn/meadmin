<template>
  <me-dialog v-model="show" :title="t('详情')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-descriptions class="info" :border="true" v-loading="loading">
      <el-descriptions-item :label="t('ID')">{{ formatterStrExec(data?.id) }}</el-descriptions-item>
      <el-descriptions-item :label="t('用户名')">{{ formatterStrExec(data?.username) }}</el-descriptions-item>
      <el-descriptions-item :label="t('昵称')">{{ formatterStrExec(data?.nickname) }}</el-descriptions-item>
      <el-descriptions-item :label="t('头像')">
        <el-image
          class="view-img"
          :src="data?.avatar?.url"
          :zoom-rate="1.2"
          :max-scale="7"
          :min-scale="0.2"
          :preview-src-list="data?.avatar?.url ? [data?.avatar.url] : undefined"
          show-progress
          preview-teleported
          fit="scale-down"
        />
      </el-descriptions-item>
      <el-descriptions-item :label="t('邮箱')">
        {{ formatterStrExec(data?.email) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('手机号')">
        {{ formatterStrExec(data?.mobile) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('登录失败次数')">
        {{ formatterStrExec(data?.loginFailure) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('最后登录时间')">
        {{ formatterStrExec(data?.lastLoginAt) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('最后登录ip')">
        {{ formatterStrExec(data?.lastLoginIp) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('状态')">
        {{ formatterDictExec(dict, 'status', data?.status) }}
      </el-descriptions-item>
      <el-descriptions-item :label="t('具有的角色')">
        <el-tag v-for="item in data?.roles || []">{{ item.roleName }}</el-tag>
      </el-descriptions-item>
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
import { systemAdminInfoApi } from '@/api/system/admin.js';
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
const { data, loading, runAsync } = systemAdminInfoApi({ noLoading: true });
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
