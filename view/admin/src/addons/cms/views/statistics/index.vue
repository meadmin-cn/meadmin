<template>
  <page>
    <el-button :loading="loading" @click="runAsync()">{{ t('刷新') }}</el-button>
    <div class="cms-counts">
      <el-card v-for="(count, key) in data?.counts" :key="key" shadow="never"
        ><div>{{ t(labels[key] ?? key) }}</div>
        <strong>{{ count }}</strong></el-card
      >
    </div>
    <div class="charts-grid">
      <el-card shadow="never" class="chart-card"><template #header><strong>{{ t('内容增长趋势') }}</strong></template><div ref="trendChartRef" class="chart" /></el-card>
      <el-card shadow="never" class="chart-card"><template #header><strong>{{ t('内容结构分布') }}</strong></template><div ref="distributionChartRef" class="chart" /></el-card>
    </div>
    <h3>{{ t('近14天新增（UTC）') }}</h3>
    <me-vxe-table :data="data?.trends ?? []" :loading="loading" border @refresh="runAsync()"><vxe-column field="date" :title="t('日期')" /><vxe-column field="articles" :title="t('文章')" /><vxe-column field="comments" :title="t('评论')" /></me-vxe-table>
  </page>
</template>
<script setup lang="ts">
import { useLocalesI18n } from '@/locales/i18n';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { nextTick, ref, watch } from 'vue';
import request from '@/utils/request';
echarts.use([BarChart, LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);
const trendChartRef = ref<HTMLElement>();
const distributionChartRef = ref<HTMLElement>();
let trendChart: echarts.ECharts | undefined;
let distributionChart: echarts.ECharts | undefined;
const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../lang/${locale}.json`), 'cms']);
const labels: Record<string, string> = { article: '文章', category: '栏目', tag: '标签', topic: '专题', page: '单页', block: '区块', comment: '评论', pendingArticles: '待审核文章', pendingComments: '待审核评论', published: '已到发布时间', scheduled: '定时发布' };
const { data, loading, runAsync } = request<{ counts: Record<string, number>; trends: Array<{ date: string; articles: number; comments: number }> }, []>(() => ({ url: 'addons/cms/statistics/', method: 'get' }), { noLoading: true });
const renderCharts = () => {
  if (!trendChartRef.value || !distributionChartRef.value || !data.value) return;
  trendChart ??= echarts.init(trendChartRef.value);
  distributionChart ??= echarts.init(distributionChartRef.value);
  const trends = data.value.trends ?? [];
  trendChart.setOption({ tooltip: { trigger: 'axis' }, legend: { data: ['文章', '评论'] }, grid: { left: 36, right: 20, top: 30, bottom: 24, containLabel: true }, xAxis: { type: 'category', data: trends.map((item) => item.date.slice(5)) }, yAxis: { type: 'value' }, series: [{ name: '文章', type: 'line', smooth: true, areaStyle: { opacity: 0.16 }, data: trends.map((item) => item.articles) }, { name: '评论', type: 'line', smooth: true, data: trends.map((item) => item.comments) }] });
  const counts = data.value.counts;
  distributionChart.setOption({ tooltip: { trigger: 'item' }, legend: { bottom: 0 }, series: [{ type: 'pie', radius: ['42%', '70%'], data: [{ name: '文章', value: counts.article }, { name: '评论', value: counts.comment }, { name: '栏目', value: counts.category }, { name: '下载资源', value: counts.download ?? 0 }] }] });
};
watch(data, async () => { await nextTick(); renderCharts(); }, { deep: true });
await Promise.all([loadRes, runAsync()]);
await nextTick();
renderCharts();
</script>
<style scoped>
.charts-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(320px, 1fr);
  gap: 16px;
  margin: 16px 0;
}
.chart {
  height: 300px;
}
.cms-counts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin: 20px 0;
}
.cms-counts strong {
  display: block;
  font-size: 30px;
  color: var(--el-color-primary);
  margin-top: 12px;
}
</style>
