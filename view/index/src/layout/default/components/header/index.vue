<template>
  <div class="header">
    <router-link :to="PageEnum.HOME" class="brand">
      <me-icon-logo :size="30" style="fill: none" />
      <span class="brand-name">{{ globalStore.websiteName }}</span>
    </router-link>
    <div ref="menuRef" class="menu">
      <nav-menu :items="desktopMenus" mode="desktop" :active="active" />
    </div>
    <div class="right">
      <!-- 右侧扩展区：默认更新日志，可通过 right 插槽整体替换（移动端隐藏） -->
      <div class="right-ext">
        <slot name="right">
          <a class="nav-ext" :href="changelogUrl" rel="noopener"> 更新日志<span class="new">New</span> </a>
        </slot>
      </div>
      <User></User>
      <button class="hamburger" aria-label="打开菜单" @click="mobileOpen = !mobileOpen">
        <me-icon-menu :size="22" />
      </button>
    </div>
    <!-- 移动端折叠菜单 -->
    <div class="mobile-menu" :class="{ open: mobileOpen }">
      <nav-menu :items="menus" mode="mobile" :active="active" @navigate="mobileOpen = false" />
      <!-- 移动端右侧扩展区：默认更新日志，可通过 mobile-right 插槽整体替换 -->
      <slot name="mobile-right">
        <a class="mm-ext" :href="changelogUrl" rel="noopener"> 更新日志 </a>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts" name="LayoutHeader">
import { PageEnum } from '@/dict/pageEnum';
import { useGlobalStore, useRouteStore } from '@/store';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import NavMenu from './components/navMenu.vue';
import User from './components/user.vue';

// TODO: 替换为真实的更新日志地址
const changelogUrl = 'https://github.com/meadmin-cn/meadmin/blob/master/CHANGELOG.md';

// menus 可由外部（如插件页面）通过 props 传入，缺省时使用站点动态路由菜单
// active 可传入当前激活菜单路径（如 doc 插件按路由参数计算），缺省时取当前路由 path
const props = defineProps<{ menus?: RouteRecordRaw[]; active?: string }>();

const globalStore = useGlobalStore();
const routeStore = useRouteStore();
const mobileOpen = ref(false);
const viewportWidth = ref(1920);
const menuRef = ref<HTMLElement>();
const availableMenuWidth = ref(0);

const menus = computed(() => props.menus ?? routeStore.routes);
const menuTitle = (item: RouteRecordRaw) => String(item.meta?.title ?? '');
const estimateMenuWidth = (item: RouteRecordRaw) => Math.max(86, Array.from(menuTitle(item)).reduce((total, char) => total + (/[\u4e00-\u9fff]/.test(char) ? 15 : 8), 0) + 34 + (item.children?.length ? 18 : 0));
const desktopMenus = computed<RouteRecordRaw[]>(() => {
  const source = menus.value.filter((item) => !item.meta?.hideMenu && !item.meta?.overflowMenu && item.path !== '/__more__');
  const available = Math.max(120, availableMenuWidth.value || viewportWidth.value - 560);
  let used = 0;
  let count = 0;
  for (const item of source) {
    const next = estimateMenuWidth(item);
    const reserveMore = source.length > count + 1 ? 58 : 0;
    if (used + next + reserveMore > available) break;
    used += next;
    count += 1;
  }
  if (count >= source.length) return source;
  const visible = source.slice(0, Math.max(1, count));
  const overflow = source.slice(visible.length);
  return [...visible, { path: '/__more__', meta: { title: '…', alwaysShow: true, overflowMenu: true }, children: overflow } as RouteRecordRaw];
});
let resizeObserver: ResizeObserver | undefined;
const updateViewport = () => {
  viewportWidth.value = window.innerWidth;
};
onMounted(() => {
  updateViewport();
  window.addEventListener('resize', updateViewport);
  resizeObserver = new ResizeObserver(([entry]) => {
    availableMenuWidth.value = entry.contentRect.width;
  });
  if (menuRef.value) resizeObserver.observe(menuRef.value);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewport);
  resizeObserver?.disconnect();
});
</script>
<style lang="scss" scoped>
.header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  height: 66px;
  font-family: 'Plus Jakarta Sans', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 8px;
  .brand-name {
    font-size: 19px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #181c28;
    white-space: nowrap;
  }
}
.menu {
  flex: 1 1 auto;
  min-width: 0;
  overflow: visible;
}
.menu > :deep(.nv-list) {
  min-width: 0;
  overflow: visible;
}
.right {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}
.right-ext {
  display: flex;
  align-items: center;
}
.nav-ext {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 9px 12px;
  font-size: 14.5px;
  font-weight: 500;
  color: #454b5c;
  border-radius: 8px;
  transition: 0.2s;
  white-space: nowrap;
  &:hover {
    color: #2b5cff;
    background: #f6f8fc;
  }
  .new {
    margin-left: 2px;
    padding: 2px 7px;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    background: #2b5cff;
    border-radius: 999px;
  }
}
.hamburger {
  display: none;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid #e8ebf2;
  border-radius: 9px;
  background: #fff;
  cursor: pointer;
  color: #181c28;
}
.mobile-menu {
  display: none;
  position: absolute;
  top: 66px;
  left: 0;
  right: 0;
  z-index: 59;
  max-height: calc(100vh - 66px);
  overflow: auto;
  flex-direction: column;
  gap: 4px;
  padding: 14px 24px 20px;
  background: #fff;
  border-bottom: 1px solid #e8ebf2;
  box-shadow: 0 8px 24px -8px rgba(24, 36, 88, 0.16);
  &.open {
    display: flex;
  }
  .mm-ext {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 12px;
    font-size: 16px;
    font-weight: 500;
    color: #2b5cff;
    border-top: 1px solid #e8ebf2;
  }
}
@media (max-width: 1240px) {
  .header {
    gap: 10px;
  }
  .brand {
    margin-right: 0;
  }
  .menu :deep(.nv-link) {
    padding-right: 9px;
    padding-left: 9px;
    font-size: 14px;
  }
  .right-ext :deep(.cms-search-input) {
    width: 190px;
  }
}
@media (max-width: 980px) {
  .header {
    height: 62px;
  }
  .menu,
  .right-ext {
    display: none;
  }
  .hamburger {
    display: flex;
  }
  .mobile-menu {
    top: 62px;
    padding-right: 16px;
    padding-left: 16px;
  }
}
@media (min-width: 981px) and (max-width: 1180px) {
  .header {
    gap: 8px;
  }
  .brand,
  .right {
    flex: 0 0 auto;
  }
  .brand-name {
    font-size: 17px;
  }
  .right-ext :deep(.cms-search-input) {
    width: 160px;
  }
  .menu :deep(.nv-link) {
    padding-right: 8px;
    padding-left: 8px;
    font-size: 13px;
  }
}
</style>
