<template>
  <page>
    <div class="stat-header">
      <div>
        <h2 class="stat-title">{{ t('内容运营统计') }}</h2>
        <p class="stat-subtitle">
          {{ t('近 14 天运营概览') }}
          <span v-if="data?.timezone" class="stat-tz">· {{ t('统计时区') }} {{ data.timezone }}</span>
        </p>
      </div>
      <el-button :loading="loading" @click="runAsync()">
        <el-icon><Refresh /></el-icon>{{ t('刷新') }}
      </el-button>
    </div>

    <!-- 大卡：总量 + 近 14 天环比 -->
    <div class="hero-grid">
      <div v-for="item in heroCards" :key="item.key" class="hero-card">
        <span class="hero-card__icon" :style="{ backgroundImage: item.gradient }">
          <el-icon><component :is="item.icon" /></el-icon>
        </span>
        <div class="hero-card__body">
          <strong class="hero-card__value">{{ item.value }}</strong>
          <div class="hero-card__label">{{ item.label }}</div>
        </div>
        <span v-if="item.delta !== null" class="hero-card__delta" :class="item.delta > 0 ? 'is-up' : 'is-down'">{{ item.delta > 0 ? '+' : '' }}{{ item.delta }}%</span>
      </div>
    </div>

    <!-- 小卡：待审核 / 已发布 / 已收金额 -->
    <div class="mini-grid">
      <div v-for="item in miniCards" :key="item.key" class="mini-card">
        <strong class="mini-card__value" :class="{ 'mini-card__value--money': item.key === 'paid' }">{{ item.value }}</strong>
        <div class="mini-card__label">{{ item.label }}</div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card chart-card--wide">
        <div class="chart-card__head">
          <span class="chart-card__bar" style="background: #6366f1" />
          <span class="chart-card__title">{{ t('近14天新增趋势') }}</span>
          <span class="chart-card__meta">{{ t('单位：条') }}</span>
        </div>
        <div ref="trendChartRef" class="chart chart--trend" />
      </div>

      <div class="chart-card">
        <div class="chart-card__head">
          <span class="chart-card__bar" style="background: #f43f5e" />
          <span class="chart-card__title">{{ t('订单状态分布') }}</span>
          <span class="chart-card__meta">{{ t('近 14 天') }}</span>
        </div>
        <div ref="orderChartRef" class="chart chart--donut" />
      </div>

      <div class="chart-card">
        <div class="chart-card__head">
          <span class="chart-card__bar" style="background: #8b5cf6" />
          <span class="chart-card__title">{{ t('栏目文章分布') }}</span>
          <span class="chart-card__meta">{{ t('近 14 天') }}</span>
        </div>
        <div ref="categoryChartRef" class="chart chart--donut" />
      </div>

      <div class="chart-card chart-card--wide">
        <div class="chart-card__head">
          <span class="chart-card__bar" style="background: #10b981" />
          <span class="chart-card__title">{{ t('下载资源排行') }}</span>
          <span class="chart-card__meta">{{ t('近 14 天') }}</span>
        </div>
        <div ref="downloadChartRef" class="chart chart--rank" :style="{ height: rankChartHeight }" />
      </div>

      <div class="chart-card chart-card--wide">
        <div class="chart-card__head">
          <span class="chart-card__bar" style="background: #2563eb" />
          <span class="chart-card__title">{{ t('热门文章排行') }}</span>
          <span class="chart-card__meta">{{ t('近 14 天') }}</span>
        </div>
        <div ref="viewChartRef" class="chart chart--rank" :style="{ height: rankChartHeight }" />
      </div>
    </div>

    <h3 class="stat-section-title">{{ t('近14天新增明细') }}</h3>
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
import { ChatLineRound, Document, Download, Refresh, Tickets } from '@element-plus/icons-vue';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GraphicComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { Component } from 'vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
echarts.use([BarChart, LineChart, PieChart, GridComponent, LegendComponent, TitleComponent, TooltipComponent, GraphicComponent, CanvasRenderer]);

// 统一色系（方案 A · 现代简约）
const C = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#f43f5e',
  purple: '#8b5cf6',
  blue: '#2563eb',
  // 图表系列色
  series: ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#2563eb', '#ec4899', '#14b8a6'],
  // 大卡图标渐变（135deg）
  gradient: {
    article: 'linear-gradient(135deg, #6366f1, #8b8ff9)',
    download: 'linear-gradient(135deg, #10b981, #4ade80)',
    comment: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    order: 'linear-gradient(135deg, #f43f5e, #fb7185)',
  },
};

// ---- 图表视觉基线：只影响样式，不参与数据处理 ----
const AXIS_LABEL = { color: '#94a3b8', fontSize: 11 };
const AXIS_LABEL_STRONG = { color: '#64748b', fontSize: 11 };
const SPLIT_LINE = { lineStyle: { color: '#eef1f6', type: 'dashed' } };
const LEGEND_TEXT = { color: '#64748b', fontSize: 11 };
const TOOLTIP_BASE = {
  backgroundColor: '#fff',
  borderColor: '#e5e8ef',
  textStyle: { color: '#0f172a' },
  extraCssText: 'box-shadow:0 4px 16px rgba(16,24,40,.12);border-radius:10px;',
};
const BASE_OPTION = { animationDuration: 500, textStyle: { fontFamily: 'inherit' } };
/** 居中「暂无数据」占位 */
const emptyGraphic = (text: string) => [{ type: 'text', left: 'center', top: 'middle', style: { text, fill: '#a8b1c1', fontSize: 13 } }];
/** 环形图中心汇总：与 series.center 的 x 对齐（30%），大字总数 + 小字说明 */
const donutCenterGraphic = (value: number, label: string) => [
  { type: 'text', left: '30%', top: '43%', style: { text: value.toLocaleString('zh-CN'), fill: '#0f172a', fontSize: 24, fontWeight: 800, textAlign: 'center' } },
  { type: 'text', left: '30%', top: '54%', style: { text: label, fill: '#94a3b8', fontSize: 10, textAlign: 'center' } },
];
/** 面积纵向渐变：顶部 22% 主题色 → 底部透明 */
const areaGradient = (rgb: string) =>
  new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: `rgba(${rgb}, .22)` },
    { offset: 1, color: `rgba(${rgb}, 0)` },
  ]);
/** 条形横向渐变：左淡 → 右实 */
const barGradient = (rgb: string, solid: string) =>
  new echarts.graphic.LinearGradient(0, 0, 1, 0, [
    { offset: 0, color: `rgba(${rgb}, .55)` },
    { offset: 1, color: solid },
  ]);
/** 图例右侧竖排的「名称 数值」格式化 */
const legendFormatter = (rows: Array<{ name: string; value: number }>) => {
  const map = new Map(rows.map((row) => [row.name, row.value]));
  return (name: string) => `${name}  ${map.get(name) ?? 0}`;
};

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
  /** 上一周期（再往前 14 天）新增数；旧后端响应可能没有该字段 */
  previous?: { articles: number; comments: number; orders: number };
  categoryDistribution: Array<{ title: string; total: number }>;
  downloadRanking: Array<{ title: string; slug: string; total: number }>;
  viewRanking: Array<{ title: string; slug: string; total: number }>;
  timezone?: string;
}
const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../lang/${locale}.json`), 'cms']);
const { data, loading, runAsync } = request<StatData, []>(() => ({ url: 'addons/cms/statistics/', method: 'get' }), { noLoading: true });

/** 近 14 天某一指标合计（环比的当前值） */
const sumTrend = (key: 'articles' | 'comments' | 'orders') => (data.value?.trends ?? []).reduce((sum, item) => sum + item[key], 0);
/**
 * 环比百分比：上一周期为 0 时无法计算，返回 null（不展示，避免出现假数据）；
 * 结果为 0（持平）同样返回 null。
 */
const percentDelta = (cur: number, prev: number): number | null => {
  if (!prev) return null;
  const delta = Math.round(((cur - prev) / prev) * 100);
  return delta === 0 ? null : delta;
};

// 卡片数据源：前 4 项为大卡（带环比与图标），后 4 项为小卡
interface StatCard {
  key: string;
  variant: 'hero' | 'mini';
  label: string;
  value: number | string;
  color: string;
  /** 仅大卡：图标块渐变背景 */
  gradient?: string;
  /** 仅大卡：图标组件 */
  icon?: Component;
  /** 环比百分比；null 表示不展示 */
  delta: number | null;
}
const cards = computed<StatCard[]>(() => {
  const c = data.value?.counts ?? {};
  const paid = data.value?.paidAmount ?? 0;
  const previous = data.value?.previous;
  const fmtMoney = (n: number) => `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
  return [
    { key: 'article', variant: 'hero', label: t('文章'), value: c.article ?? 0, color: C.primary, gradient: C.gradient.article, icon: Document, delta: percentDelta(sumTrend('articles'), previous?.articles ?? 0) },
    { key: 'download', variant: 'hero', label: t('下载资源'), value: c.download ?? 0, color: C.success, gradient: C.gradient.download, icon: Download, delta: null },
    { key: 'comment', variant: 'hero', label: t('评论'), value: c.comment ?? 0, color: C.warning, gradient: C.gradient.comment, icon: ChatLineRound, delta: percentDelta(sumTrend('comments'), previous?.comments ?? 0) },
    { key: 'order', variant: 'hero', label: t('订单'), value: c.order ?? 0, color: C.danger, gradient: C.gradient.order, icon: Tickets, delta: percentDelta(sumTrend('orders'), previous?.orders ?? 0) },
    { key: 'pendingArticles', variant: 'mini', label: t('待审核文章'), value: c.pendingArticles ?? 0, color: C.warning, delta: null },
    { key: 'pendingComments', variant: 'mini', label: t('待审核评论'), value: c.pendingComments ?? 0, color: C.warning, delta: null },
    { key: 'published', variant: 'mini', label: t('已发布'), value: c.published ?? 0, color: C.success, delta: null },
    { key: 'paid', variant: 'mini', label: t('已收金额'), value: fmtMoney(paid), color: C.primary, delta: null },
  ];
});
const heroCards = computed(() => cards.value.filter((item) => item.variant === 'hero'));
const miniCards = computed(() => cards.value.filter((item) => item.variant === 'mini'));

// 两个排行条形图都独占整行，按条目数自适应高度（220~360px）
const rankChartHeight = computed(() => {
  const rows = Math.max(data.value?.downloadRanking?.length ?? 0, data.value?.viewRanking?.length ?? 0);
  return `${Math.min(360, Math.max(220, rows * 34 + 60))}px`;
});

const renderCharts = () => {
  if (!data.value) return;
  const d = data.value;

  // —— 趋势图 ——
  const trends = d.trends ?? [];
  const trendEmpty = trends.every((item) => !item.articles && !item.comments && !item.orders);
  initChart('trend', trendChartRef.value)?.setOption(
    {
      ...BASE_OPTION,
      color: C.series,
      tooltip: { ...TOOLTIP_BASE, trigger: 'axis' },
      legend: { data: [t('文章'), t('评论'), t('订单')], top: 0, right: 8, icon: 'roundRect', itemWidth: 10, itemHeight: 3, textStyle: LEGEND_TEXT },
      grid: { left: 8, right: 16, top: 28, bottom: 8, containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: trends.map((item) => item.date.slice(5)), axisLine: { show: false }, axisTick: { show: false }, axisLabel: AXIS_LABEL },
      yAxis: { type: 'value', minInterval: 1, splitLine: SPLIT_LINE, axisLine: { show: false }, axisTick: { show: false }, axisLabel: AXIS_LABEL },
      graphic: trendEmpty ? emptyGraphic(t('暂无数据')) : [],
      series: [
        { name: t('文章'), type: 'line', smooth: true, showSymbol: false, lineStyle: { width: 2 }, areaStyle: { color: areaGradient('99,102,241') }, data: trends.map((item) => item.articles) },
        { name: t('评论'), type: 'line', smooth: true, showSymbol: false, lineStyle: { width: 2 }, areaStyle: { color: areaGradient('16,185,129') }, data: trends.map((item) => item.comments) },
        { name: t('订单'), type: 'line', smooth: true, showSymbol: false, lineStyle: { width: 2 }, areaStyle: { color: areaGradient('245,158,11') }, data: trends.map((item) => item.orders) },
      ],
    },
    { notMerge: true },
  );

  // —— 订单状态分布（环在左 30%，图例右侧竖排） ——
  const o = d.orderTotalMap ?? {};
  const orderLabels = [t('待处理'), t('处理中'), t('已完成'), t('已关闭')];
  const orderValues = orderLabels.map((_, i) => o[`s${i}`] ?? 0);
  const orderRows = orderLabels.map((name, i) => ({ name, value: orderValues[i] }));
  const orderTotal = orderValues.reduce((sum, value) => sum + value, 0);
  const orderEmpty = orderTotal <= 0;
  initChart('order', orderChartRef.value)?.setOption(
    {
      ...BASE_OPTION,
      color: [C.warning, C.primary, C.success, C.danger],
      tooltip: { ...TOOLTIP_BASE, trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { show: !orderEmpty, orient: 'vertical', right: 0, top: 'middle', icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 10, textStyle: LEGEND_TEXT, formatter: legendFormatter(orderRows) },
      graphic: orderEmpty ? emptyGraphic(t('暂无数据')) : donutCenterGraphic(orderTotal, t('总订单')),
      series: [
        {
          type: 'pie',
          center: ['30%', '50%'],
          radius: ['52%', '74%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          data: orderEmpty ? [] : orderRows,
        },
      ],
    },
    { notMerge: true },
  );

  // —— 栏目文章分布 ——
  const cat = d.categoryDistribution ?? [];
  const categoryRows = cat.map((item) => ({ name: item.title, value: item.total }));
  const categoryTotal = categoryRows.reduce((sum, item) => sum + item.value, 0);
  const categoryEmpty = categoryTotal <= 0;
  initChart('category', categoryChartRef.value)?.setOption(
    {
      ...BASE_OPTION,
      color: C.series,
      tooltip: { ...TOOLTIP_BASE, trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { show: !categoryEmpty, type: 'scroll', orient: 'vertical', right: 0, top: 'middle', icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 10, textStyle: LEGEND_TEXT, formatter: legendFormatter(categoryRows) },
      graphic: categoryEmpty ? emptyGraphic(t('暂无数据')) : donutCenterGraphic(categoryTotal, t('总文章')),
      series: [
        {
          type: 'pie',
          center: ['30%', '50%'],
          radius: ['52%', '74%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          data: categoryEmpty ? [] : categoryRows,
        },
      ],
    },
    { notMerge: true },
  );

  // —— 下载资源排行 ——
  const dl = (d.downloadRanking ?? []).slice().reverse();
  initChart('download', downloadChartRef.value)?.setOption(
    {
      ...BASE_OPTION,
      tooltip: { ...TOOLTIP_BASE, trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 8, right: 48, top: 12, bottom: 8, containLabel: true },
      xAxis: { type: 'value', minInterval: 1, splitLine: SPLIT_LINE, axisLine: { show: false }, axisTick: { show: false }, axisLabel: AXIS_LABEL },
      yAxis: { type: 'category', data: dl.map((item) => item.title), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { ...AXIS_LABEL_STRONG, width: 150, overflow: 'truncate' } },
      graphic: dl.length ? [] : emptyGraphic(t('暂无数据')),
      series: [
        {
          type: 'bar',
          barWidth: '52%',
          itemStyle: { borderRadius: [0, 6, 6, 0], color: barGradient('167,243,208', '#10b981') },
          label: { show: true, position: 'right', color: '#94a3b8', fontSize: 11 },
          data: dl.map((item) => item.total),
        },
      ],
    },
    { notMerge: true },
  );

  // —— 热门文章排行 ——
  const vw = (d.viewRanking ?? []).slice().reverse();
  initChart('view', viewChartRef.value)?.setOption(
    {
      ...BASE_OPTION,
      tooltip: { ...TOOLTIP_BASE, trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 8, right: 48, top: 12, bottom: 8, containLabel: true },
      xAxis: { type: 'value', minInterval: 1, splitLine: SPLIT_LINE, axisLine: { show: false }, axisTick: { show: false }, axisLabel: AXIS_LABEL },
      yAxis: { type: 'category', data: vw.map((item) => item.title), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { ...AXIS_LABEL_STRONG, width: 150, overflow: 'truncate' } },
      graphic: vw.length ? [] : emptyGraphic(t('暂无数据')),
      series: [
        {
          type: 'bar',
          barWidth: '52%',
          itemStyle: { borderRadius: [0, 6, 6, 0], color: barGradient('191,219,254', '#2563eb') },
          label: { show: true, position: 'right', color: '#94a3b8', fontSize: 11 },
          data: vw.map((item) => item.total),
        },
      ],
    },
    { notMerge: true },
  );
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
/* ---------- 页头 ---------- */
.stat-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 14px;
}
.stat-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.2px;
  color: #0f172a;
}
.stat-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: #6b7280;
}
.stat-tz {
  color: #6366f1;
}

/* ---------- 大卡 ---------- */
.hero-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
.hero-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 16px 18px;
  background: #fff;
  border-radius: 16px;
  box-shadow:
    0 1px 2px rgba(16, 24, 40, 0.05),
    0 1px 3px rgba(16, 24, 40, 0.06);
  transition:
    box-shadow 0.2s,
    transform 0.2s;
}
.hero-card:hover {
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.1);
  transform: translateY(-1px);
}
.hero-card__icon {
  flex: 0 0 42px;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  color: #fff;
}
.hero-card__icon .el-icon {
  font-size: 20px;
}
.hero-card__body {
  min-width: 0;
}
.hero-card__value {
  display: block;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.5px;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}
.hero-card__label {
  margin-top: 3px;
  font-size: 12px;
  color: #6b7280;
}
.hero-card__delta {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.4;
}
.hero-card__delta.is-up {
  background: #e7f7ee;
  color: #1a8a52;
}
.hero-card__delta.is-down {
  background: #fdecef;
  color: #c0415f;
}

/* ---------- 小卡 ---------- */
.mini-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
}
.mini-card {
  min-width: 0;
  padding: 12px 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow:
    0 1px 2px rgba(16, 24, 40, 0.05),
    0 1px 3px rgba(16, 24, 40, 0.06);
}
.mini-card__value {
  display: block;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.15;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 金额位数较多：降字号 + 轻微收紧字距，4 列下不溢出 */
.mini-card__value--money {
  font-size: 20px;
  letter-spacing: -0.3px;
}
.mini-card__label {
  margin-top: 3px;
  font-size: 12px;
  color: #6b7280;
}

/* ---------- 图表区 ---------- */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 14px;
}
.chart-card {
  min-width: 0;
  padding: 16px 18px;
  background: #fff;
  border-radius: 16px;
  box-shadow:
    0 1px 2px rgba(16, 24, 40, 0.05),
    0 1px 3px rgba(16, 24, 40, 0.06);
}
.chart-card--wide {
  grid-column: 1 / -1;
}
.chart-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.chart-card__bar {
  width: 3px;
  height: 13px;
  border-radius: 2px;
}
.chart-card__title {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}
.chart-card__meta {
  margin-left: auto;
  font-size: 11px;
  color: #94a3b8;
}
.chart {
  height: 260px;
}
.chart--trend {
  height: 240px;
}
/* 环形图：环在左 30%，图例右侧竖排；限制最大宽度后整体居中，避免宽屏下过度拉伸 */
.chart--donut {
  width: min(100%, 520px);
  margin: 0 auto;
}

/* ---------- 明细区标题 ---------- */
.stat-section-title {
  position: relative;
  margin: 16px 0 12px;
  padding-left: 10px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: #334155;
}
.stat-section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 3px;
  height: 14px;
  border-radius: 2px;
  background: linear-gradient(180deg, #6366f1, #8b8ff9);
  transform: translateY(-50%);
}

@media (max-width: 900px) {
  .hero-grid,
  .mini-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
