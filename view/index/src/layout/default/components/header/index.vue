<template>
  <div class="header">
    <div class="left">
      <router-link :to="PageEnum.HOME">Me - Admin</router-link>
    </div>
    <el-menu :default-active="activeMenu" class="menu" mode="horizontal">
      <template v-for="item in menus" :key="item.path">
        <menu-item  :item="item" v-if="canMenu(item)" />
      </template>
    </el-menu>
    <div class="right">
      <User></User>
    </div>
  </div>
</template>

<script setup lang="ts" name="Header">
import { PageEnum } from '@/dict/pageEnum';
import { useRouteStore } from '@/store';
import { ref } from 'vue';
import MenuItem from './components/menuItem.vue';
import User from './components/user.vue';
import { RouteRecordRaw } from 'vue-router';
const route = useRoute();
const routeStore = useRouteStore();
const activeMenu = ref('');
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
const canMenu = (menu:RouteRecordRaw):boolean=>{
  if(!menu.meta?.hideMenu){
    return true;
  }
  if(menu.children?.length){
    return menu.children.some(v=>canMenu(v));
  }
  return false;
}
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
