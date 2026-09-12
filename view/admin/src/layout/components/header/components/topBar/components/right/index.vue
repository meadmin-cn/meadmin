<template>
  <div class="right">
    <me-search-menu v-if="themeConfig.showSearchMenu" class="item"></me-search-menu>
    <!-- 设计稿 .tb-icon：30×30 圆角方块图标；暗黑切换为月亮/太阳图标 -->
    <div v-if="themeConfig.showDark && !globalStore.isMobile" class="item" @click="setting.isDark = !setting.isDark">
      <me-icon-sunny v-if="setting.isDark" class="icon"></me-icon-sunny>
      <me-icon-moon v-else class="icon"></me-icon-moon>
    </div>
    <me-locale-select v-if="localeConfig.localeList.length > 1 && !globalStore.isMobile" class="item"></me-locale-select>
    <me-size-select v-if="themeConfig.showSize && !globalStore.isMobile" class="item"></me-size-select>
    <!-- 设计稿 v1.4 .tb-icon ⤢：全屏切换（原系统无此功能，按设计稿补齐） -->
    <div v-if="!globalStore.isMobile" class="item" @click="toggleFullscreen">
      <me-icon-fullscreen-exit v-if="isFullscreen" class="icon"></me-icon-fullscreen-exit>
      <me-icon-fullscreen v-else class="icon"></me-icon-fullscreen>
    </div>
    <message-box class="item"></message-box>
    <user class="item user-item"></user>
    <me-setting v-if="themeConfig.showSetting && !globalStore.isMobile" class="item"></me-setting>
  </div>
</template>
<script setup lang="ts" name="Right">
import { localeConfig } from '@/config';
import { useGlobalStore, useSettingStore } from '@/store';
import MessageBox from './components/messageBox.vue';
import User from './components/user.vue';
const { themeConfig } = storeToRefs(useSettingStore());
const setting = useSettingStore();
const globalStore = useGlobalStore();

// 设计稿 ⤢：全屏切换（原生 Fullscreen API）
const isFullscreen = ref(false);
const syncFullscreen = () => {
  isFullscreen.value = !!document.fullscreenElement;
};
onMounted(() => {
  document.addEventListener('fullscreenchange', syncFullscreen);
  syncFullscreen();
});
onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', syncFullscreen);
});
const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
};
</script>
<style lang="scss" scoped>
.right {
  font-size: 14px;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 2px;

  // 设计稿 .tb-icon：30×30、圆角 8px、hover 浅灰底
  .item {
    width: 30px;
    height: 30px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-regular);
    flex-shrink: 0;
    cursor: pointer;
  }

  .item:hover {
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-primary);
  }

  // 子组件内部统一撑满 30×30 并居中（原组件有 0 10px padding，登录页等处不受影响）
  .item:deep(> *) {
    padding: 0 !important;
    margin: 0 !important;
  }

  .item:deep(.flex-center),
  .item:deep(.me-search-menu),
  .item:deep(.me-setting) {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // 图标统一 17px（细线 SVG 在 30×30 方块内的视觉平衡尺寸；需 !important 压过子组件 scoped 的 1.2em/1.3em）
  .item:deep(.icon) {
    font-size: 17px !important;
  }

  .item:deep(.message-icon) {
    height: auto;
    line-height: 1;
  }

  // 用户项（设计稿 .tb-user）：头像+昵称整体一个 hover 区域
  .user-item {
    width: auto;
    padding: 4px 10px 4px 4px;
    border-radius: 6px;
    gap: 9px;
  }
}
</style>
