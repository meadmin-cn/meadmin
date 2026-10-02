<script setup lang="ts">
import { computed } from 'vue';

/** 前台统一的线性 SVG 图标，解决浏览/点赞/评论/举报等图标缺失的问题 */
export type CmsIconName = 'view' | 'like' | 'comment' | 'report' | 'reply' | 'download' | 'calendar' | 'tag' | 'folder' | 'clock' | 'search' | 'arrow-right' | 'warning';

const paths: Record<CmsIconName, string[]> = {
  // 眼睛：浏览
  'view': ['M2.6 12S6.2 5.6 12 5.6 21.4 12 21.4 12 17.8 18.4 12 18.4 2.6 12 2.6 12Z', 'M12 15.3a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Z'],
  // 心形：点赞
  'like': ['M20.2 5.9a4.8 4.8 0 0 0-6.8 0L12 7.3l-1.4-1.4a4.8 4.8 0 1 0-6.8 6.8L12 20.8l8.2-8.1a4.8 4.8 0 0 0 0-6.8Z'],
  // 气泡：评论
  'comment': ['M21 14.5a2 2 0 0 1-2 2H8l-5 4V5.5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z'],
  // 旗帜：举报
  'report': ['M4 15.2s1-1.1 4-1.1 5 2.1 8 2.1 4-1 4-1V3.2s-1 1.1-4 1.1-5-2.1-8-2.1-4 1-4 1Z', 'M4 21.5v-6.3'],
  // 折返箭头：回复
  'reply': ['M9.2 14.2 4.2 9.2l5-5', 'M20.2 20.2v-7.2a4 4 0 0 0-4-4H4.2'],
  // 下载
  'download': ['M12 3.2v12.2', 'm7.2 10.6 4.8 4.8 4.8-4.8', 'M20.8 15.2v3.8a2 2 0 0 1-2 2H5.2a2 2 0 0 1-2-2v-3.8'],
  // 日历
  'calendar': ['M8 2.4v4', 'M16 2.4v4', 'M3.2 9.8h17.6', 'M5 4.4h14a2 2 0 0 1 2 2v13.2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.4a2 2 0 0 1 2-2Z'],
  // 标签
  'tag': ['M12.6 2.6A2 2 0 0 0 11.2 2H4.2a2 2 0 0 0-2 2v7a2 2 0 0 0 .6 1.4l8.7 8.7a2.43 2.43 0 0 0 3.4 0l6.6-6.6a2.43 2.43 0 0 0 0-3.4Z', 'M7.6 8.6a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Z'],
  // 目录（圆角书签式文件夹，比默认文件夹更轻巧精致）
  'folder': ['M4.4 4.4h5.1a2 2 0 0 1 1.6.8l.9 1.2H19.6a2 2 0 0 1 2 2v9.2a2 2 0 0 1-2 2H4.4a2 2 0 0 1-2-2V6.4a2 2 0 0 1 2-2Z', 'M7.8 13.6h8.4'],
  // 时间
  'clock': ['M12 21.2a9.2 9.2 0 1 0 0-18.4 9.2 9.2 0 0 0 0 18.4Z', 'M12 6.8v5.6l3.4 2'],
  // 搜索
  'search': ['M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z', 'm15.8 15.8 5.2 5.2'],
  // 右箭头
  'arrow-right': ['M4.8 12h14.4', 'm13.8 6 5.9 6-5.9 6'],
  // 警示
  'warning': ['M12 3.4 21.2 20H2.8Z', 'M12 9.6v4.6', 'M12 17.4h.01'],
};

const props = withDefaults(
  defineProps<{
    name: CmsIconName;
    size?: number | string;
  }>(),
  { size: 16 },
);

const iconPaths = computed<string[]>(() => paths[props.name] ?? []);
</script>

<template>
  <svg class="cms-icon" viewBox="0 0 24 24" :width="size" :height="size" aria-hidden="true" focusable="false">
    <path v-for="(item, index) in iconPaths" :key="index" :d="item" />
  </svg>
</template>

<style scoped>
.cms-icon {
  display: inline-block;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
  vertical-align: -0.14em;
}
</style>
