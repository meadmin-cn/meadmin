<template>
  <div class="dashboard">
    <div class="page-head">
      <div class="ph-title">{{ t('数据概览') }}</div>
      <div class="date-pill">
        <mel-icon-calendar></mel-icon-calendar>
        <span>{{ dateRange }}</span>
      </div>
    </div>
    <total-panel></total-panel>
    <charts></charts>
  </div>
</template>

<script setup lang="ts">
import { useLocalesI18n } from '@/locales/i18n';
import Charts from './components/charts.vue';
import TotalPanel from './components/totalPanel.vue';
const { t, loadRes } = useLocalesI18n({}, [(locale) => import(`../lang/${locale}.json`), 'index']);
await loadRes;

// 近 7 日日期范围（设计稿 date-pill）
const dateRange = (() => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `${fmt(start)} ~ ${fmt(end)}`;
})();
</script>
<style lang="scss" scoped>
.dashboard {
  /* 外层 .me-main 已有 padding:18px，此处只需铺满内容 */
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}
.page-head {
  flex-shrink: 0;
}
:deep(.stat-row) {
  flex-shrink: 0;
}
:deep(.charts-row) {
  flex-shrink: 0;
}
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .ph-title {
    font-size: 17px;
    font-weight: 800;
    color: var(--el-text-color-primary);
  }
  .date-pill {
    display: flex;
    align-items: center;
    gap: 7px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 9px;
    padding: 7px 13px;
    font-size: 12.5px;
    color: var(--el-text-color-secondary);

    svg {
      width: 14px;
      height: 14px;
    }
  }
}
</style>
