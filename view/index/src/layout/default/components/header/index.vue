<template>
  <div class="header">
    <router-link :to="PageEnum.HOME" class="brand">
      <me-icon-logo :size="30" style="fill: none" />
      <span class="brand-name">{{ globalStore.websiteName }}</span>
    </router-link>
    <nav-menu class="menu" :items="menus" mode="desktop" />
    <div class="right">
      <a class="nav-ext" :href="changelogUrl" rel="noopener"> 更新日志<span class="new">New</span> </a>
      <User></User>
      <button class="hamburger" aria-label="打开菜单" @click="mobileOpen = !mobileOpen">
        <me-icon-menu :size="22" />
      </button>
    </div>
    <!-- 移动端折叠菜单 -->
    <div class="mobile-menu" :class="{ open: mobileOpen }">
      <nav-menu :items="menus" mode="mobile" @navigate="mobileOpen = false" />
      <a class="mm-ext" :href="changelogUrl" rel="noopener"> 更新日志 </a>
    </div>
  </div>
</template>

<script setup lang="ts" name="LayoutHeader">
import { PageEnum } from '@/dict/pageEnum';
import { useGlobalStore, useRouteStore } from '@/store';
import { ref } from 'vue';
import NavMenu from './components/navMenu.vue';
import User from './components/user.vue';

// TODO: 替换为真实的更新日志地址
const changelogUrl = 'https://www.meadmin.cn/aon/doc';

const globalStore = useGlobalStore();
const routeStore = useRouteStore();
const mobileOpen = ref(false);

const menus = computed(() => {
  return routeStore.routes;
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
  flex: 1;
  min-width: 0;
}
.right {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
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
@media (max-width: 960px) {
  .menu,
  .nav-ext {
    display: none;
  }
  .hamburger {
    display: flex;
  }
}
</style>
