<template>
  <page>
    <div class="stat-header">
      <div>
        <h2>{{ t('内容运营统计') }}</h2>
        <p class="stat-subtitle">
          {{ t('近 14 天运营概览') }}
          <span v-if="data?.timezone" class="stat-tz">· {{ t('统计时区') }} {{ data.timezone }}</span>
        </p>
      </div>
      <el-button :loading="loading" @click="runAsync()">
        <el-icon><Refresh /></el-icon>{{ t('刷新') }}
      </el-button>
    </div>

    <div class="cms-counts">
      <el-card v-for="item in cards" :key="item.key" shadow="never" class="cms-counts__item" :style="{ '--accent': item.color, '--accent-soft': item.soft }">
        <span class="cms-counts__icon"
          ><el-icon><component :is="item.icon" /></el-icon
        ></span>
        <div class="cms-counts__body">
          <div class="cms-counts__label">{{ item.label }}</div>
          <strong class="cms-counts__value">{{ item.value }}</strong>
        </div>
        <span class="cms-counts__bar" />
      </el-card>
    </div>

    <div class="charts-grid">
      <el-card shadow="never" class="chart-card chart-card--wide">
        <template #header
          ><span class="chart-head"
            ><el-icon><TrendCharts /></el-icon>{{ t('近14天新增趋势') }}</span
          ></template
        >
        <div ref="trendChartRef" class="chart chart--trend" />
      </el-card>
      <el-card shadow="never" class="chart-card">
        <template #header
          ><span class="chart-head"
            ><el-icon><List /></el-icon>{{ t('订单状态分布') }}</span
          ></template
        >
        <div ref="orderChartRef" class="chart" />
      </el-card>
      <el-card shadow="never" class="chart-card">
        <template #header
          ><span class="chart-head"
            ><el-icon><Menu /></el-icon>{{ t('栏目文章分布') }}</span
          ></template
        >
        <div ref="categoryChartRef" class="chart" />
      </el-card>
      <el-card shadow="never" class="chart-card">
        <template #header
          ><span class="chart-head"
            ><el-icon><Download /></el-icon>{{ t('下载资源排行') }}</span
          ></template
        >
        <div ref="downloadChartRef" class="chart" />
      </el-card>
      <el-card shadow="never" class="chart-card chart-card--wide">
        <template #header
          ><span class="chart-head"
            ><el-icon><View /></el-icon>{{ t('热门文章排行') }}</span
          ></template
        >
        <div ref="viewChartRef" class="chart" />
      </el-card>
    </div>

    <h3>{{ t('近14天新增明细') }}</h3>
    <me-vxe-table :data="data?.trends ?? []" :loading="loading" border @refresh="runAsync()">
      <vxe-column field="date" :title="t('日期')" width="140" />
      <vxe-column field="articles" :title="t('文章')" />
      <vxe-column field="comments" :title="t('评论')" />
      <vxe-column field="orders" :title="t('订单')" />
    </me-vxe-table>
  </page>
</template>
<script setup lang="ts">
import { useLocalesI18n } from '@/locales/i18n';
import request from '@/utils/request';
import { ChatLineRound, CircleCheck, Clock, Document, Download, List, Menu, Refresh, Tickets, TrendCharts, View, Wallet } from '@element-plus/icons-vue';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
echarts.use([BarChart, LineChart, PieChart, GridComponent, LegendComponent, TitleComponent, TooltipComponent, CanvasRenderer]);

// 统一色系：采用更柔和、低饱和的淡色，避免页面过于花哨
const C = {
  primary: '#5b8def',
  success: '#3fb27f',
  warning: '#e0a458',
  danger: '#e2738f',
  purple: '#9a82d8',
  cyan: '#4cb8cf',
  // 图表系列色（淡色，降低饱和）
  series: ['#7aa7f0', '#5cb88c', '#e0a458', '#e2738f', '#9a82d8', '#4cb8cf', '#d98bb0', '#5cc0b0'],
};
// 卡片图标底色（更淡的同色系）
const soft = (hex: string) => `color-mix(in srgb, ${hex} 14%, #ffffff)`;

const trendChartRef = ref<HTMLElement>();
const orderChartRef = ref<HTMLElement>();
const categoryChartRef = ref<HTMLElement>();
const downloadChartRef = ref<HTMLElement>();
const viewChartRef = ref<HTMLElement>();
const charts: Record<string, echarts.ECharts> = {};
const initChart = (key: string, el?: HTMLElement) => {
  if (!el) return;
  if (!charts[key]) charts[key] = echarts.init(el);
  return charts[key];
};

interface StatData {
  counts: Record<string, number>;
  orderTotalMap: Record<string, number>;
  paidAmount: number;
  trends: Array<{ date: string; articles: number; comments: number; orders: number }>;
  categoryDistribution: Array<{ title: string; total: number }>;
  downloadRanking: Array<{ title: string; slug: string; total: number }>;
  viewRanking: Array<{ title: string; slug: string; total: number }>;
  timezone?: string;
}
const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../lang/${locale}.json`), 'cms']);
const { data, loading, runAsync } = request<StatData, []>(() => ({ url: 'addons/cms/statistics/', method: 'get' }), { noLoading: true });

const cards = computed(() => {
  const c = data.value?.counts ?? {};
  const paid = data.value?.paidAmount ?? 0;
  const fmtMoney = (n: number) => `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
  return [
    { key: 'article', label: t('文章'), value: c.article ?? 0, color: C.primary, soft: soft(C.primary), icon: Document },
    { key: 'download', label: t('下载资源'), value: c.download ?? 0, color: C.success, soft: soft(C.success), icon: Download },
    { key: 'comment', label: t('评论'), value: c.comment ?? 0, color: C.warning, soft: soft(C.warning), icon: ChatLineRound },
    { key: 'order', label: t('订单'), value: c.order ?? 0, color: C.danger, soft: soft(C.danger), icon: Tickets },
    { key: 'pendingArticles', label: t('待审核文章'), value: c.pendingArticles ?? 0, color: C.warning, soft: soft(C.warning), icon: Clock },
    { key: 'pendingComments', label: t('待审核评论'), value: c.pendingComments ?? 0, color: C.warning, soft: soft(C.warning), icon: ChatLineRound },
    { key: 'published', label: t('已发布'), value: c.published ?? 0, color: C.success, soft: soft(C.success), icon: CircleCheck },
    { key: 'paid', label: t('已收金额'), value: fmtMoney(paid), color: C.cyan, soft: soft(C.cyan), icon: Wallet },
  ];
});

const renderCharts = () => {
  if (!data.value) return;
  const d = data.value;
  const trends = d.trends ?? [];
  initChart('trend', trendChartRef.value)?.setOption({
    color: C.series,
    tooltip: { trigger: 'axis' },
    legend: { data: [t('文章'), t('评论'), t('订单')], bottom: 0 },
    grid: { left: 36, right: 20, top: 24, bottom: 36, containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: trends.map((item) => item.date.slice(5)) },
    yAxis: { type: 'value' },
    series: [
      { name: t('文章'), type: 'line', smooth: true, showSymbol: false, areaStyle: { opacity: 0.12 }, lineStyle: { width: 2 }, data: trends.map((item) => item.articles) },
      { name: t('评论'), type: 'line', smooth: true, showSymbol: false, areaStyle: { opacity: 0.1 }, data: trends.map((item) => item.comments) },
      { name: t('订单'), type: 'line', smooth: true, showSymbol: false, areaStyle: { opacity: 0.1 }, data: trends.map((item) => item.orders) },
    ],
  });

  const o = d.orderTotalMap ?? {};
  const orderLabels = [t('待处理'), t('处理中'), t('已完成'), t('已关闭')];
  const orderValues = orderLabels.map((_, i) => o[`s${i}`] ?? 0);
  initChart('order', orderChartRef.value)?.setOption({
    color: [C.warning, C.primary, C.success, C.danger],
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, icon: 'circle' },
    series: [{ type: 'pie', radius: ['45%', '70%'], avoidLabelOverlap: true, itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 }, label: { show: false }, data: orderLabels.map((name, i) => ({ name, value: orderValues[i] })) }],
  });

  const cat = d.categoryDistribution ?? [];
  initChart('category', categoryChartRef.value)?.setOption({
    color: C.series,
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, type: 'scroll', icon: 'circle' },
    series: [{ type: 'pie', radius: ['42%', '68%'], avoidLabelOverlap: true, itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 }, label: { show: false }, data: cat.map((item) => ({ name: item.title, value: item.total })) }],
  });

  const dl = (d.downloadRanking ?? []).slice().reverse();
  initChart('download', downloadChartRef.value)?.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 12, right: 28, top: 12, bottom: 12, containLabel: true },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: dl.map((item) => item.title) },
    series: [{ type: 'bar', barWidth: '56%', itemStyle: { color: C.success, borderRadius: [0, 6, 6, 0] }, data: dl.map((item) => item.total) }],
  });

  const vw = (d.viewRanking ?? []).slice().reverse();
  initChart('view', viewChartRef.value)?.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 12, right: 28, top: 12, bottom: 12, containLabel: true },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: vw.map((item) => item.title) },
    series: [{ type: 'bar', barWidth: '56%', itemStyle: { color: C.primary, borderRadius: [0, 6, 6, 0] }, data: vw.map((item) => item.total) }],
  });
};
watch(
  data,
  async () => {
    await nextTick();
    renderCharts();
  },
  { deep: true },
);
const handleResize = () => Object.values(charts).forEach((chart) => chart.resize());
// 初始渲染必须在组件挂载后执行，否则模板 ref 尚未就绪，图表无法初始化
onMounted(async () => {
  await nextTick();
  renderCharts();
  window.addEventListener('resize', handleResize);
});
onBeforeUnmount(() => window.removeEventListener('resize', handleResize));
await Promise.all([loadRes, runAsync()]);
</script>
<style scoped>
.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.stat-header h2 {
  margin: 0;
  font-size: 18px;
}
.stat-subtitle {
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.stat-tz {
  margin-left: 4px;
  color: var(--el-color-primary);
}
.cms-counts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin: 16px 0;
}
.cms-counts__item {
  --accent: var(--el-color-primary);
  position: relative;
  overflow: hidden;
  border: none;
  background: var(--accent-soft, #f5f7fa);
}
.cms-counts__item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--accent);
}
.cms-counts__icon {
  position: absolute;
  top: 14px;
  right: 14px;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 16%, #fff);
}
.cms-counts__icon .el-icon {
  font-size: 18px;
}
.cms-counts__body {
  padding-right: 44px;
}
.cms-counts__label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.cms-counts__value {
  display: block;
  font-size: 28px;
  margin-top: 10px;
  color: var(--accent);
}
.cms-counts__bar {
  display: block;
  margin-top: 10px;
  height: 4px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--accent) 30%, transparent);
}
.charts-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 1fr);
  gap: 16px;
  margin: 16px 0;
}
.chart-card {
  border: none;
}
.chart-card--wide {
  grid-column: 1 / -1;
}
.chart-head {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}
.chart-head .el-icon {
  color: var(--el-color-primary);
}
.chart {
  height: 300px;
}
.chart--trend {
  height: 280px;
}
h3 {
  margin: 20px 0 12px;
  font-size: 15px;
}
@media (max-width: 900px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
