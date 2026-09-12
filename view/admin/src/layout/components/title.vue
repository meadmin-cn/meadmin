<template>
  <div class="title" :class="{ 'is-collapsed': isCollapsedSidebarTitle }">
    <me-icon-logo :size="logoSize" style="fill: none" class="logo" />
    <span>{{ settingConfig.websiteName }}</span>
  </div>
</template>

<script setup lang="ts" name="Title">
import { settingConfig } from '@/config';
import { useGlobalStore, useSettingStore } from '@/store';
import { getColorLuma } from '@/utils/helper';

const settingStore = useSettingStore();
const globalStore = useGlobalStore();
const { themeConfig } = storeToRefs(settingStore);
// onTopbar: 位于白色顶栏（深色文字）；否则位于深色侧栏/抽屉（按菜单底色取对比色）
const props = defineProps<{ onTopbar?: boolean }>();
const isCompact = computed(() => settingStore.menuType !== 'sidebar');
const onTopBar = computed(() => props.onTopbar ?? (isCompact.value && !globalStore.isMobile));
const isCollapsedSidebarTitle = computed(() => !onTopBar.value && !globalStore.isMobile && themeConfig.value.menuCollapse);
const titleWidth = computed(() => {
  if (onTopBar.value || globalStore.isMobile) {
    return 'auto';
  }
  return isCollapsedSidebarTitle.value ? '64px' : themeConfig.value.menuWidth;
});
const titlePadding = computed(() => (onTopBar.value ? '0 6px 0 0' : isCollapsedSidebarTitle.value ? '0' : '0 16px'));
const titleJustify = computed(() => (isCollapsedSidebarTitle.value ? 'center' : 'flex-start'));
const titleFontSize = computed(() => (onTopBar.value ? '17px' : globalStore.isMobile ? '15px' : '1.25em'));
const titleGap = computed(() => (isCollapsedSidebarTitle.value ? '0' : isCompact.value ? '9px' : '8px'));
const titleTextOpacity = computed(() => (isCollapsedSidebarTitle.value ? 0 : 1));
// 顶栏标题用主题文字色变量（暗黑模式下自动反白），侧栏/抽屉标题按菜单底色取对比色
const titleColor = computed(() => (onTopBar.value ? 'var(--el-text-color-primary)' : getColorLuma(themeConfig.value.menuBg) < 100 ? '#ffffff' : '#303133'));
const logoSize = computed(() => (globalStore.isMobile ? 22 : 28));
</script>
<style lang="scss" scoped>
.title {
  height: $header-top-height;
  font-weight: bold;
  padding: v-bind(titlePadding);
  font-size: v-bind(titleFontSize);
  word-break: break-all;
  overflow: hidden;
  background-color: inherit;
  width: v-bind(titleWidth);
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: v-bind(titleJustify);
  gap: v-bind(titleGap);
  flex-shrink: 0;
  transition:
    width 0.22s cubic-bezier(0.2, 0, 0, 1),
    padding 0.22s cubic-bezier(0.2, 0, 0, 1);
  .logo {
    flex-shrink: 0;
  }
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: v-bind(titleColor);
    opacity: v-bind(titleTextOpacity);
    transition: opacity 0.14s ease;
  }
  &.is-collapsed span {
    display: none;
  }

  @media (max-width: 768px) {
    height: 50px;
  }
}
</style>
