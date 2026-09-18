<template>
  <div class="stat-row">
    <div v-for="(item, index) in list" :key="index" class="stat">
      <div class="sl">
        <span class="label">{{ item.title }}</span>
        <span class="chip">{{ item.chip }}</span>
      </div>
      <div class="sv">
        <me-number :end="item.total"></me-number>
      </div>
      <div class="st" :class="item.trendType">
        <span class="trend-arrow">{{ item.trendType === 'down' ? '▼' : '▲' }}</span>
        <span class="trend-val">{{ item.trendVal }}</span>
        <span class="trend-sub">{{ item.subTitle }}</span>
      </div>
      <div class="icon" :style="{ color: item.iconColor, background: item.iconBg }">
        <component :is="item.icon"></component>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useLocalesI18n } from '@/locales/i18n';
const { t, loadRes } = useLocalesI18n({}, [(locale) => import(`../lang/${locale}.json`), 'index']);
await loadRes;
const data = reactive({
  view: {
    total: Math.floor(Math.random() * 100000),
    yesterdayTotal: Math.floor(Math.random() * 10000),
  },
  user: {
    total: Math.floor(Math.random() * 100000),
    yesterdayTotal: Math.floor(Math.random() * 1000),
  },
  order: {
    total: Math.floor(Math.random() * 100000),
    yesterdayTotal: Math.floor(Math.random() * 1000),
  },
  turnover: {
    total: Math.floor(Math.random() * 1000000000) / 100,
    yesterdayTotal: Math.floor(Math.random() * 1000000) / 100,
  },
});
const list = reactive([
  {
    title: computed(() => t('访问量')),
    chip: '日',
    icon: 'mel-icon-platform',
    iconColor: '#2b5cff',
    iconBg: 'rgba(43, 92, 255, 0.1)',
    total: data.view.total,
    trendType: 'up',
    trendVal: '12.5%',
    subTitle: computed(() => t('较上周')),
  },
  {
    title: t('用户数'),
    chip: '周',
    icon: 'mel-icon-user-filled',
    iconColor: '#0ea36b',
    iconBg: 'rgba(14, 163, 107, 0.1)',
    total: data.user.total,
    trendType: 'up',
    trendVal: '6.2%',
    subTitle: computed(() => t('较上周')),
  },
  {
    title: computed(() => t('订单数')),
    chip: '月',
    icon: 'mel-icon-histogram',
    iconColor: '#e0455a',
    iconBg: 'rgba(224, 69, 90, 0.1)',
    total: data.order.total,
    trendType: 'down',
    trendVal: '2.1%',
    subTitle: computed(() => t('较上周')),
  },
  {
    title: computed(() => t('成交额')),
    chip: '月',
    icon: 'mel-icon-money',
    iconColor: '#ba7517',
    iconBg: 'rgba(186, 117, 23, 0.1)',
    total: [data.turnover.total, '￥'] as [number, string],
    trendType: 'up',
    trendVal: '18.9%',
    subTitle: computed(() => t('较上周')),
  },
]);
</script>
<style lang="scss" scoped>
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 14px;
}
.stat {
  position: relative;
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 2px 10px rgba(16, 24, 40, 0.04);
  border: 1px solid var(--el-border-color-lighter);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(16, 24, 40, 0.08);
  }

  .sl {
    font-size: 12.5px;
    color: var(--el-text-color-secondary);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 48px;

    .chip {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 20px;
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      font-weight: 600;
      line-height: 1.6;
    }
  }

  .sv {
    font-size: 24px;
    font-weight: 800;
    margin-top: 10px;
    letter-spacing: -0.02em;
    color: var(--el-text-color-primary);
    font-variant-numeric: tabular-nums;
  }

  .st {
    font-size: 11.5px;
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 5px;

    .trend-arrow {
      font-size: 10px;
    }
    .trend-val {
      font-weight: 700;
    }
    .trend-sub {
      color: var(--el-text-color-placeholder);
    }

    &.up {
      color: #e0455a;
    }
    &.down {
      color: #0ea36b;
    }
  }

  .icon {
    position: absolute;
    top: 16px;
    right: 18px;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(svg) {
      width: 18px;
      height: 18px;
    }
  }
}
@media (max-width: 992px) {
  .stat-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 576px) {
  .stat-row {
    grid-template-columns: 1fr;
  }
}
</style>
