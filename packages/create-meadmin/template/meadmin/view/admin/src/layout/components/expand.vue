<template>
  <!-- 设计稿 .tb-icon ☰：细线三线图标（非 Element 加粗 Fold），30×30 圆角方块由 left.vue 提供 -->
  <div class="expand-wrap" @click="setMenuCollapse">
    <svg class="fold-expand pointer" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <line x1="1.75" y1="3.5" x2="14.25" y2="3.5" />
      <line x1="1.75" y1="8" x2="14.25" y2="8" />
      <line x1="1.75" y1="12.5" x2="14.25" y2="12.5" />
    </svg>
  </div>
</template>
<script setup lang="ts" name="Expand">
import { useSettingStore } from '@/store';
const { themeConfig } = storeToRefs(useSettingStore());
const setMenuCollapse = () => {
  themeConfig.value.menuCollapse = !themeConfig.value.menuCollapse;
};
</script>
<style lang="scss" scoped>
.expand-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  .fold-expand {
    width: 16px;
    height: 16px;
  }
}
</style>
