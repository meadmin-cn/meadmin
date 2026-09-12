<template>
  <div style="position: relative; height: 100%">
    <el-menu class="top-menu" :default-active="activeMenu" mode="horizontal" :ellipsis="true">
      <layout-menu-item v-for="item in menus" :key="item.path" :is-top="true" :item="item" />
    </el-menu>
  </div>
</template>

<script setup lang="ts" name="TopMenu">
import { useRouteStore, useSettingStore } from '@/store';
const { menuType } = storeToRefs(useSettingStore());
const routeStore = useRouteStore();
const route = useRoute();

const menus = computed(() => {
  return routeStore.routes.filter((item) => {
    // 无子菜单的一级菜单(如控制台/首页)也正常展示:点击跳自身,侧栏展示其自身
    return !(!item.meta || item.meta.hideMenu || !item.meta.title);
  });
});
const hasChildPath = (item: any, path: string): boolean => {
  return item.path === path || item.children?.some((child: any) => hasChildPath(child, path));
};
const getTopPathByRoute = (path: string) => {
  const normalizedPath = path.split('?')[0].split('#')[0];
  return menus.value.find((item) => normalizedPath === item.path || normalizedPath.startsWith(item.path + '/') || hasChildPath(item, normalizedPath))?.path;
};
// 选中态：mix 模式一级菜单 :index 是顶级 path，activeMenu 返回顶级 path 才能匹配
// top 模式 el-sub-menu 内子菜单 :index 是子菜单 path，activeMenu 返回 route.path 由 el-menu 自动高亮父级
const activeMenu = computed(() => {
  const raw = route.meta.hideMenu && route.meta.activeMenu ? route.meta.activeMenu : route.path;
  if (menuType.value === 'mix') {
    const idx = route.meta?.menuIndex?.[0];
    return (idx != null ? routeStore.routes[idx]?.path : undefined) || getTopPathByRoute(raw) || raw;
  }
  return raw;
});
</script>
<style lang="scss" scoped>
.top-menu {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  right: 0;
  border-bottom: 0;
  align-items: center;

  // 一级菜单：圆角胶囊，选中实心主题色白字（超出由 el-menu 横向模式自动折叠为「…」）
  // 注意：element-plus 横向模式选中文字色带 !important，此处必须同步 !important 才能覆盖
  :deep(.el-menu-item),
  :deep(.el-sub-menu .el-sub-menu__title) {
    height: 30px;
    line-height: 30px;
    margin: 0 2px;
    padding: 0 13px;
    border-radius: 6px;
    border-bottom: none !important;
    font-size: 13.5px;
    font-weight: 500;
  }
  // 设计稿：顶部一级菜单纯文字（图标仅出现在下拉中），由 hide-icon prop 控制
  :deep(.el-menu-item:hover),
  :deep(.el-sub-menu__title:hover) {
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-primary);
  }
  :deep(.el-menu-item.is-active),
  :deep(.el-sub-menu.is-active .el-sub-menu__title) {
    background-color: var(--el-color-primary);
    color: var(--el-color-white) !important;
    font-weight: 600;
    box-shadow: 0 4px 10px rgba(var(--el-color-primary-rgb), 0.2);
  }
  :deep(.el-menu-item.is-active:hover),
  :deep(.el-sub-menu.is-active .el-sub-menu__title:hover) {
    background-color: var(--el-color-primary);
    color: var(--el-color-white) !important;
  }
  :deep(.el-menu-item.el-menu__overflow-item) {
    min-width: 30px;
    padding: 0;
    justify-content: center;
    color: var(--el-text-color-regular);
  }
  :deep(.el-sub-menu.el-menu__overflow-item .el-sub-menu__title) {
    min-width: 30px;
    padding: 0;
    justify-content: center;
    color: var(--el-text-color-regular);
  }
  :deep(.el-menu__overflow-item .el-sub-menu__icon-more),
  :deep(.el-menu__overflow-item .el-icon.el-sub-menu__icon-more) {
    display: flex !important;
    width: 18px;
    height: 18px;
    margin: 0;
    color: var(--el-text-color-regular);
  }
  :deep(.el-sub-menu.el-sub-menu__hide-arrow .el-sub-menu__title) {
    min-width: 30px;
    padding: 0;
    justify-content: center;
  }
  :deep(.el-sub-menu.el-sub-menu__hide-arrow .el-sub-menu__icon-more) {
    display: flex !important;
    width: 18px;
    height: 18px;
    margin: 0;
    color: currentColor;
  }
  :deep(.el-sub-menu.el-sub-menu__hide-arrow .el-sub-menu__icon-arrow) {
    display: none !important;
  }
  // 选中胶囊内不显示下划线/箭头变色异常
  :deep(.el-sub-menu.is-active .el-sub-menu__title .el-sub-menu__icon-arrow) {
    color: var(--el-color-white) !important;
  }
}
// 设计稿：顶部一级菜单纯文字，图标仅出现在「…」/下拉弹层中
// 注意必须写在 .top-menu 块外（:deep 需经由外层 div 命中 .el-menu--horizontal 本体）
:deep(.el-menu--horizontal > .el-menu-item > .el-icon),
:deep(.el-menu--horizontal > .el-sub-menu:not(.el-menu__overflow-item):not(.el-sub-menu__hide-arrow) > .el-sub-menu__title > .el-icon) {
  display: none;
}
</style>
<style lang="scss">
// 顶部菜单下拉弹层（teleport 到 body，需全局样式，设计稿 v1.4 .fly-panel）
.el-menu--horizontal .el-menu--popup,
.el-menu--popup-container .el-menu--popup {
  border-radius: 8px;
  padding: 5px;
  min-width: 150px;

  .el-menu {
    border-radius: 6px;
  }
  .el-menu-item,
  .el-sub-menu .el-sub-menu__title {
    height: 34px;
    line-height: 34px;
    border-radius: 6px;
    font-size: 12.5px;
    color: var(--el-text-color-regular);
    margin: 1px 0;
  }
  .el-menu-item:hover,
  .el-sub-menu .el-sub-menu__title:hover {
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-primary);
  }
  // 下拉项选中：主题色文字 + 浅蓝底
  .el-menu-item.is-active {
    color: var(--el-color-primary) !important;
    background-color: rgba(var(--el-color-primary-rgb), 0.08);
    font-weight: 600;
  }
  .el-menu-item .el-icon,
  .el-sub-menu__title .el-icon {
    margin-right: 8px;
  }
}
</style>
