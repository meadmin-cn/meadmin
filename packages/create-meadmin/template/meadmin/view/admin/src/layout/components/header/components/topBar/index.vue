<template>
  <div class="top-bar" :class="{ 'is-mix': menuType === 'mix' }">
    <Title v-if="menuType !== 'sidebar' || globalStore.isMobile" on-topbar class="tb-title"></Title>
    <div v-if="menuType !== 'sidebar' && !globalStore.isMobile" class="tb-divider"></div>
    <Left v-if="menuType !== 'top'"></Left>
    <top-menu v-if="menuType !== 'sidebar' && !globalStore.isMobile" class="menu"></top-menu>
    <Right></Right>
  </div>
</template>

<script setup lang="ts" name="TopBar">
import Title from '@/layout/components/title.vue';
import { useGlobalStore, useSettingStore } from '@/store';
import { getColorLuma, mixColor } from '@/utils/helper';
import Left from './components/left.vue';
import Right from './components/right/index.vue';
import TopMenu from './components/topMenu.vue';
const { themeConfig, menuType } = storeToRefs(useSettingStore());
const globalStore = useGlobalStore();
const menuBg1 = computed(() => mixColor(themeConfig.value.menuBg, getColorLuma(themeConfig.value.menuBg) < 100 ? '#ffffff' : '#303133', 0.1));
</script>
<style lang="scss" scoped>
.top-bar {
  height: $header-top-height;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1px;
  box-shadow: 0 1px var(--el-border-color);
  overflow: hidden;
  padding: 0 16px 0 14px;
  gap: 10px;
  @at-root .dark #{&} {
    box-shadow: 0 1px v-bind(menuBg1);
  }
  .menu {
    flex: 1;
    min-width: 0;
  }
  // 设计稿 .tb-divider：Logo 与 ☰ 之间的竖分隔线（用主题边框色变量，暗黑模式自动适配）
  .tb-divider {
    width: 1px;
    height: 22px;
    background: var(--el-border-color);
    flex-shrink: 0;
  }

  &.is-mix {
    :deep(.left) {
      margin-left: -4px;
    }
  }

  // 移动端（设计稿 v1.4）：顶栏精简为 50px，顺序为 ☰ + Logo + 右侧工具
  @media (max-width: 768px) {
    height: 50px;
    padding: 0 10px;
    gap: 6px;

    .tb-divider {
      display: none;
    }
    :deep(.left) {
      order: -1;
      margin-left: 0;
    }
    :deep(.right) {
      margin-left: auto;
    }
  }
}
</style>
