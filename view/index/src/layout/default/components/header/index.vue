<template>
  <div class="header">
    <div class="left">
      <router-link :to="PageEnum.HOME">Me - Admin</router-link>
    </div>
    <el-menu :default-active="activeMenu" class="menu" mode="horizontal">
      <menu-item v-for="item in menus" :key="item.path" :item="item" />
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
const route = useRoute();
const routeStore = useRouteStore();
let activeMenu = ref('');
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
