<template>
  <!-- 第一行:浏览量趋势(主图) + 销售排行(柱图) -->
  <div class="charts-row charts-row-top">
    <div class="panel panel-main">
      <div class="p-head">
        <div class="pt">{{ t('浏览量趋势') }}</div>
        <div class="ps">{{ t('近 7 日 PV / UV') }}</div>
      </div>
      <el-skeleton :rows="8" :loading="false" class="chart-body">
        <div ref="viewChartRef" class="view-charts"></div>
      </el-skeleton>
    </div>

    <div class="panel">
      <div class="p-head">
        <div class="pt">{{ t('销售排行') }}</div>
        <div class="ps">{{ t('近 7 日 TOP 类目') }}</div>
      </div>
      <el-skeleton :rows="8" :loading="false" class="chart-body">
        <div ref="salesChartRef" class="view-charts"></div>
      </el-skeleton>
    </div>
  </div>

  <!-- 第二行:三联图(访问来源 + 订单分布 + 时段分布) -->
  <div class="charts-row charts-row-trio">
    <div class="panel">
      <div class="p-head">
        <div class="pt">{{ t('访问来源') }}</div>
        <div class="ps">{{ t('近 30 日') }}</div>
      </div>
      <el-skeleton :rows="8" :loading="false" class="chart-body">
        <div ref="origionChartRef" class="view-charts"></div>
      </el-skeleton>
    </div>

    <div class="panel">
      <div class="p-head">
        <div class="pt">{{ t('订单分布') }}</div>
        <div class="ps">{{ t('近 30 日') }}</div>
      </div>
      <el-skeleton :rows="8" :loading="false" class="chart-body">
        <div ref="orderDistributionChartRef" class="view-charts"></div>
      </el-skeleton>
    </div>

    <div class="panel">
      <div class="p-head">
        <div class="pt">{{ t('时段分布') }}</div>
        <div class="ps">{{ t('近 7 日每小时访问') }}</div>
      </div>
      <el-skeleton :rows="8" :loading="false" class="chart-body">
        <div ref="allocationChartRef" class="view-charts"></div>
      </el-skeleton>
    </div>
  </div>
</template>
<script setup lang="ts" name="viewCharts">
import { event, mitter } from '@/event';
import { useLocalesI18n } from '@/locales/i18n';
import { useSettingStore } from '@/store';
import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { UniversalTransition } from 'echarts/features';
import { SVGRenderer } from 'echarts/renderers';
import { throttle } from 'lodash-es';
const { t, loadRes } = useLocalesI18n({}, [(locale) => import(`../lang/${locale}.json`), 'dashboard']);
await loadRes;
echarts.use([TitleComponent, ToolboxComponent, TooltipComponent, GridComponent, LegendComponent, LineChart, PieChart, RadarChart, BarChart, SVGRenderer, UniversalTransition]);
const viewChartRef = ref(null as HTMLElement | null);
const origionChartRef = ref(null as HTMLElement | null);
const allocationChartRef = ref(null as HTMLElement | null);
const orderDistributionChartRef = ref(null as HTMLElement | null);
const salesChartRef = ref(null as HTMLElement | null);
const setting = useSettingStore();
const textColor = computed(() => (setting.isDark ? '#E5EAF3' : '#303133'));

const data = {
  view: {
    PV: [300, 500, 800, 900, 3000, 3500, 4000, 5000, 4000, 2800, 1000],
    UV: [8, 16, 39, 42, 156, 160, 153, 200, 148, 140, 43],
  },
  origion: [1048, 735, 580, 484, 300],
  allocation: [120, 80, 60, 50, 75, 180, 420, 680, 920, 1100, 1250, 1380, 1320, 1280, 1240, 1180, 1080, 960, 860, 740, 620, 480, 320, 220],
  orderDistribution: {
    new: [4200, 3000, 20000, 35000, 50000],
    old: [5000, 14000, 28000, 26000, 42000],
  },
  sales: {
    categories: ['日用', '电子', '配饰', '服装', '化妆', '食品'],
    values: [8200, 12400, 6800, 15200, 9100, 5600],
  },
};
const viewChart = computed(() => (viewChartRef.value ? echarts.init(viewChartRef.value) : null));
const origionChart = computed(() => (origionChartRef.value ? echarts.init(origionChartRef.value) : null));
const allocationChart = computed(() => (allocationChartRef.value ? echarts.init(allocationChartRef.value) : null));
const orderDistributionChart = computed(() => (orderDistributionChartRef.value ? echarts.init(orderDistributionChartRef.value) : null));
const salesChart = computed(() => (salesChartRef.value ? echarts.init(salesChartRef.value) : null));
watchPostEffect(() => {
  const viewChartOptions = {
    color: ['#2b5cff', '#9db8ff'],
    textStyle: {
      color: textColor.value,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      top: '8px',
      right: '0',
      data: ['PV', 'UV'],
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        color: textColor.value,
        fontSize: 11.5,
      },
    },
    grid: {
      left: '20px',
      right: '20px',
      bottom: '20px',
      top: '48px',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: ['02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
      },
    ],
    yAxis: [
      {
        type: 'value',
        splitNumber: 5,
      },
    ],
    series: [
      {
        name: 'PV',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5 },
        areaStyle: {
          opacity: 0.6,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(43, 92, 255, 0.35)' },
              { offset: 1, color: 'rgba(43, 92, 255, 0.02)' },
            ],
          },
        },
        emphasis: {
          focus: 'series',
        },
        data: [] as number[],
      },
      {
        name: 'UV',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { width: 2, type: 'dashed' },
        emphasis: {
          focus: 'series',
        },
        data: [] as number[],
      },
    ],
  };
  const allocationOptions = {
    textStyle: {
      color: textColor.value,
    },
    grid: {
      left: '20px',
      right: '20px',
      bottom: '8px',
      top: '20px',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: textColor.value,
          fontSize: 10,
          interval: 3,
        },
        data: ['00', '', '', '', '04', '', '', '', '08', '', '', '', '12', '', '', '', '16', '', '', '', '20', '', '', ''],
      },
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          color: textColor.value,
          fontSize: 10,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(125, 138, 175, 0.16)',
          },
        },
      },
    ],
    series: [
      {
        name: t('访问数'),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { width: 2 },
        itemStyle: {
          color: '#2b5cff',
          borderColor: '#fff',
          borderWidth: 1,
        },
        areaStyle: {
          opacity: 0.18,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#6f9bff' },
              { offset: 1, color: '#c7d6ff' },
            ],
          },
        },
        data: [] as number[],
      },
    ],
  };
  const origionOptions = {
    color: ['#2b5cff', '#6f9bff', '#9db8ff', '#c7d6ff', '#5a8eff'],
    textStyle: {
      color: textColor.value,
    },
    legend: {
      bottom: '0',
      left: 'center',
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        color: textColor.value,
        fontSize: 11.5,
      },
    },
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'cross',
      },
    },
    series: [
      {
        name: t('访问来源'),
        type: 'pie',
        top: '-20%',
        radius: ['40%', '65%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '40',
            fontWeight: 'bold',
          },
          scaleSize: 5,
        },
        data: [
          { value: 0, name: t('直接访问') },
          { value: 0, name: t('搜索引擎') },
          { value: 0, name: t('推广邮件') },
          { value: 0, name: t('推广短信') },
          { value: 0, name: t('营销广告') },
        ],
      },
    ],
  };
  const orderDistributionOptions = {
    color: ['#2b5cff', '#6f9bff'],
    textStyle: {
      color: textColor.value,
    },
    legend: {
      data: [t('新客'), t('老客')],
      bottom: '0',
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        color: textColor.value,
        fontSize: 11.5,
      },
    },
    radar: {
      center: ['50%', '45%'],
      radius: '65%',
      splitArea: {
        areaStyle: {
          color: ['rgba(43, 92, 255, 0.02)', 'rgba(43, 92, 255, 0.04)'],
        },
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(43, 92, 255, 0.12)',
        },
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(43, 92, 255, 0.15)',
        },
      },
      axisName: {
        color: textColor.value,
        fontSize: 11,
      },
      indicator: [
        { name: t('日用/百货'), max: 6500 },
        { name: t('电子产品'), max: 16000 },
        { name: t('配饰/挂件'), max: 30000 },
        { name: t('服装/箱包'), max: 38000 },
        { name: t('化妆品'), max: 52000 },
      ],
    },
    series: [
      {
        name: t('订单分布'),
        type: 'radar',
        symbolSize: 5,
        lineStyle: { width: 2 },
        areaStyle: { opacity: 0.12 },
        data: [
          {
            value: [] as number[],
            name: t('新客'),
          },
          {
            value: [] as number[],
            name: t('老客'),
          },
        ],
      },
    ],
  };
  const salesOptions = {
    color: ['#2b5cff'],
    textStyle: {
      color: textColor.value,
    },
    grid: {
      left: '20px',
      right: '20px',
      bottom: '20px',
      top: '24px',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: [
      {
        type: 'category',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: textColor.value,
          fontSize: 11,
          interval: 0,
          formatter: (v: string) => (v.length > 3 ? v.slice(0, 3) : v),
        },
        data: data.sales.categories,
      },
    ],
    yAxis: [
      {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(43, 92, 255, 0.08)' } },
        axisLabel: { color: textColor.value, fontSize: 11 },
      },
    ],
    series: [
      {
        name: t('销售额'),
        type: 'bar',
        barWidth: 14,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#6f9bff' },
              { offset: 1, color: '#2b5cff' },
            ],
          },
        },
        data: data.sales.values,
      },
    ],
  };
  if (data) {
    viewChartOptions.series[0].data = data.view.PV;
    viewChartOptions.series[1].data = data.view.UV;
    origionOptions.series[0].data.forEach((item, key) => {
      item.value = data.origion[key];
    });
    allocationOptions.series[0].data = data.allocation;
    orderDistributionOptions.series[0].data[0].value = data.orderDistribution.new;
    orderDistributionOptions.series[0].data[1].value = data.orderDistribution.old;
    viewChart.value?.setOption(viewChartOptions);
    origionChart.value?.setOption(origionOptions);
    allocationChart.value?.setOption(allocationOptions);
    orderDistributionChart.value?.setOption(orderDistributionOptions);
    salesChart.value?.setOption(salesOptions);
  }
});
mitter.on(
  event.RESIZE,
  throttle(() => {
    viewChart.value?.resize();
    origionChart.value?.resize();
    allocationChart.value?.resize();
    orderDistributionChart.value?.resize();
    salesChart.value?.resize();
  }, 800),
  true,
);
</script>
<style lang="scss" scoped>
.charts-row {
  display: grid;
  gap: 14px;
}
.charts-row-top {
  grid-template-columns: 1.6fr 1fr;
}
.charts-row-trio {
  grid-template-columns: 1fr 1fr 1fr;
}
.panel {
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(16, 24, 40, 0.04);
  border: 1px solid var(--el-border-color-lighter);
  padding: 16px 18px;
  min-width: 0;
  transition: box-shadow 0.18s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(16, 24, 40, 0.08);
  }

  .p-head {
    margin-bottom: 10px;

    .pt {
      font-size: 14px;
      font-weight: 700;
      color: var(--el-text-color-primary);
      margin-bottom: 4px;
    }
    .ps {
      font-size: 11.5px;
      color: var(--el-text-color-placeholder);
    }
  }

  .view-charts {
    width: 100%;
    height: 280px;
  }
}
@media (max-width: 1200px) {
  .charts-row-top {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 992px) {
  .charts-row-trio {
    grid-template-columns: 1fr;
  }
}
</style>
