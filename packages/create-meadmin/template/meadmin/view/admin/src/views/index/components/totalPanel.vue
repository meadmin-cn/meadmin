<template>
  <div class="total-panel">
    <el-row :gutter="20">
      <el-col v-for="(item, index) in list" :key="index" :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" :header="item.title" class="total-item">
          <el-skeleton :loading="false">
            <div class="content">
              <div class="total">
                <me-number :end="item.total"></me-number>
                <component :is="item.icon" :style="{ color: item.iconColor }" />
              </div>
              <div class="footer">
                {{ item.subTitle }}<span>{{ item.subTotal }}</span>
              </div>
            </div>
          </el-skeleton>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script setup lang="ts">
import { useLocalesI18n } from '@/locales/i18n';
const { t, loadRes } = useLocalesI18n({}, [(locale) => import(`../lang/${locale}.json`), 'index']);
await loadRes;
const data = reactive({
  view: {
    //浏览数
    total: Math.floor(Math.random() * 100000), //合计
    yesterdayTotal: Math.floor(Math.random() * 10000), //昨日新增
  },
  user: {
    //会员数
    total: Math.floor(Math.random() * 100000),
    yesterdayTotal: Math.floor(Math.random() * 1000),
  },
  order: {
    //订单数
    total: Math.floor(Math.random() * 100000),
    yesterdayTotal: Math.floor(Math.random() * 1000),
  },
  turnover: {
    //成交额
    total: Math.floor(Math.random() * 1000000000) / 100,
    yesterdayTotal: Math.floor(Math.random() * 1000000) / 100,
  },
});
const list = reactive([
  {
    title: computed(() => t('访问量')),
    icon: 'mel-icon-platform',
    iconColor: '#409EFF',
    total: data.view.total,
    subTitle: computed(() => t('昨日新增') + '：'),
    subTotal: data.view.yesterdayTotal,
  },
  {
    title: t('用户数'),
    icon: 'mel-icon-user-filled',
    iconColor: '#67C23A',
    total: data.user.total,
    subTitle: computed(() => t('昨日新增') + '：'),
    subTotal: data.user.yesterdayTotal,
  },
  {
    title: computed(() => t('订单数')),
    icon: 'mel-icon-histogram',
    iconColor: '#E6A23C',
    total: data.order.total,
    subTitle: computed(() => t('昨日新增') + '：'),
    subTotal: data.order.yesterdayTotal,
  },
  {
    title: computed(() => t('成交额')),
    icon: 'mel-icon-money',
    iconColor: '#F56C6C',
    total: [data.turnover.total, '￥'] as [number, string],
    subTitle: computed(() => t('昨日新增') + '：'),
    subTotal: '￥' + data?.turnover.yesterdayTotal,
  },
]);
</script>
<style lang="scss" scoped>
.total-panel {
  margin-bottom: -10px;
  .total-item {
    --el-card-padding: 10px;
    margin-bottom: 10px;
    .content {
      height: 91.5px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 0 10px;
      .total {
        font-size: 24px;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-grow: 1;
        .el-icon,
        :deep(svg) {
          height: 100%;
          width: auto;
        }
      }
      .footer {
        font-size: 13px;
        color: var(--el-text-color-regular);
        span {
          font-weight: bold;
          color: var(--el-text-color-primary);
        }
      }
    }
  }
}
</style>
