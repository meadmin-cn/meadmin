<template>
  <el-dialog v-model="show" :title="title" width="min(560px, calc(100% - 32px))" :close-on-click-modal="false" :close-on-press-escape="true" append-to-body class="cms-action-confirm">
    <p class="cms-confirm-question">{{ question }}</p>
    <el-descriptions v-if="items.length" :column="1" border size="small" class="cms-confirm-desc">
      <el-descriptions-item v-for="item in items" :key="item.label" :label="item.label">
        <el-tag v-if="item.tag" size="small" :type="item.tagType ?? 'info'">{{ item.value }}</el-tag>
        <span v-else>{{ item.value === undefined || item.value === null || item.value === '' ? '—' : item.value }}</span>
      </el-descriptions-item>
    </el-descriptions>
    <slot />
    <el-alert v-if="desc" :title="desc" :type="alertType" :closable="false" show-icon class="cms-confirm-alert" />
    <template #footer>
      <el-button @click="show = false">{{ t('取消') }}</el-button>
      <el-button :type="buttonType" :loading="loading" @click="emit('confirm')">{{ confirmText }}</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { useLocalesI18n } from '@/locales/i18n';
import type { CmsConfirmAlertType, CmsConfirmButtonType, CmsConfirmItem } from './actionConfirm';
const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'cms']);
defineOptions({ name: 'AonCmsActionConfirm' });
const show = defineModel<boolean>();
withDefaults(
  defineProps<{
    title: string;
    question: string;
    /** 操作影响说明，展示在描述项下方 */
    desc?: string;
    alertType?: CmsConfirmAlertType;
    buttonType?: CmsConfirmButtonType;
    confirmText?: string;
    /** 操作对象的关键信息，帮助用户确认没点错行 */
    items?: CmsConfirmItem[];
    loading?: boolean;
  }>(),
  { alertType: 'warning', buttonType: 'primary', confirmText: '确认', items: () => [], loading: false },
);
const emit = defineEmits<{ confirm: [] }>();
await loadRes;
</script>
<style scoped>
.cms-confirm-question {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.cms-confirm-desc {
  margin-bottom: 14px;
}
.cms-confirm-alert :deep(.el-alert__description) {
  line-height: 1.7;
}
</style>
