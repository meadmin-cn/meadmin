<template>
  <div class="pos-preview">
    <svg viewBox="0 0 320 268" role="img" aria-label="展示位置示意图">
      <rect v-for="box in boxes" :key="box.key" :x="box.x" :y="box.y" :width="box.w" :height="box.h" rx="4" :class="['pos-box', { active: actives.includes(box.key) }]" />
      <text v-for="box in boxes" :key="box.key + '-t'" :x="box.x + box.w / 2" :y="box.y + box.h / 2 + box.offset" text-anchor="middle" :class="['pos-label', { active: actives.includes(box.key) }]">
        {{ box.label }}
      </text>
    </svg>
    <ul class="pos-legend">
      <li v-for="box in boxes" :key="box.key + '-l'" :class="{ active: actives.includes(box.key) }">
        <i />
        <span><b>{{ box.label }}</b><em>{{ box.position }}</em></span>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';

interface Box {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  position: string;
  offset: number;
  targets: string[];
}

const props = defineProps<{ position?: string }>();

const boxes: Box[] = [
  { key: 'header', x: 8, y: 6, w: 304, h: 16, label: '站点导航', position: '所有页面', offset: 4, targets: [] },
  { key: 'banner', x: 8, y: 28, w: 304, h: 46, label: '首页顶部轮播', position: 'home-banner', offset: 4, targets: ['home-banner'] },
  { key: 'content', x: 8, y: 82, w: 186, h: 122, label: '首页内容卡片', position: 'home-content', offset: -38, targets: ['home-content'] },
  { key: 'detail', x: 16, y: 166, w: 170, h: 32, label: '详情页正文底部', position: 'content-detail-bottom', offset: 4, targets: ['content-detail-bottom'] },
  { key: 'ranking', x: 204, y: 82, w: 108, h: 30, label: '侧边栏热门排行', position: 'home-ranking', offset: 4, targets: ['home-ranking'] },
  { key: 'sidebar', x: 204, y: 118, w: 108, h: 66, label: '右侧边栏推广', position: 'sidebar', offset: 4, targets: ['sidebar'] },
  { key: 'footer', x: 8, y: 212, w: 304, h: 50, label: '页面底部（暂未开放投放）', position: '—', offset: 4, targets: [] },
];

const actives = computed(() => {
  const value = props.position ?? '';
  return boxes
    .filter((box) => box.targets.includes(value))
    .map((box) => box.key);
});
</script>
<style scoped>
.pos-preview {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 14px;
  border: 1px solid #e6eaf2;
  border-radius: 10px;
  background: #f8fafc;
}
svg {
  width: 260px;
  flex: 0 0 260px;
}
.pos-box {
  fill: #eef1f6;
  stroke: #d7dde8;
  stroke-width: 1;
  transition:
    fill 0.2s ease,
    stroke 0.2s ease;
}
.pos-box.active {
  fill: rgba(64, 158, 255, 0.16);
  stroke: #409eff;
  stroke-width: 1.6;
}
.pos-label {
  fill: #8c96a6;
  font-size: 9px;
  font-weight: 600;
}
.pos-label.active {
  fill: #1d4ed8;
  font-weight: 700;
}
.pos-legend {
  display: grid;
  flex: 1;
  gap: 6px;
  margin: 0;
  padding: 0;
  min-width: 0;
  list-style: none;
}
.pos-legend li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7d8798;
  font-size: 12px;
  line-height: 1.5;
}
.pos-legend li i {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border: 1px solid #d7dde8;
  border-radius: 3px;
  background: #eef1f6;
}
.pos-legend li span {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: 0 8px;
}
.pos-legend li b {
  font-weight: 600;
}
.pos-legend li em {
  color: #a7b0bd;
  font-style: normal;
  font-size: 11px;
}
.pos-legend li.active {
  color: #1d4ed8;
}
.pos-legend li.active i {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.4);
}
.pos-legend li.active em {
  color: #4b7fd4;
}
@media (max-width: 860px) {
  .pos-preview {
    flex-direction: column;
  }
  svg {
    width: 100%;
    flex: 0 0 auto;
  }
}
</style>
