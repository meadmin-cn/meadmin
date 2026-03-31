<template>
  <div class="header">
    <div class="left">
      <router-link :to="PageEnum.HOME">{{ globalStore.websiteName }}</router-link>
    </div>
    <el-menu :default-active="activeMenu" class="menu" mode="horizontal">
      <template v-for="item in menus" :key="item.path">
        <menu-item v-if="canMenu(item)" :item="item" />
      </template>
    </el-menu>
    <div class="right">
      <User></User>
    </div>
  </div>
</template>

<script setup lang="ts" name="LayoutHeader">
import { PageEnum } from '@/dict/pageEnum';
import { useGlobalStore, useRouteStore } from '@/store';
import { ref } from 'vue';
import { RouteRecordRaw } from 'vue-router';
import MenuItem from './components/menuItem.vue';
import User from './components/user.vue';
const route = useRoute();
const routeStore = useRouteStore();
const activeMenu = ref('');
const globalStore = useGlobalStore();

watch(
  route,
  (route) => {
    if (route.meta) {
      activeMenu.value = route.path;
    }
  },
  { immediate: true },
);
const menus = computed(() => {
  return routeStore.routes;
});
//是否作为菜单
const canMenu = (menu: RouteRecordRaw): boolean => {
  if (!menu.meta?.hideMenu) {
    return true;
  }
  if (menu.children?.length) {
    return menu.children.some((v) => canMenu(v));
  }
  return false;
};
</script>
<style lang="scss" scoped>
.header {
  display: flex;
  .left {
    padding-right: 5px;
    font-size: 20px;
    display: flex;
    align-items: center;
  }
  .right {
  }
  .menu {
    border-bottom: unset;
    flex: 1;
  }
}
</style>
