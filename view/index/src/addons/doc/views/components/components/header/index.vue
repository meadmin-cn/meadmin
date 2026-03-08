<template>
  <div class="header">
    <div class="left">
      <router-link :to="PageEnum.HOME">Me - Admin</router-link>
    </div>
    <el-menu :default-active="activeMenu" class="menu" mode="horizontal">
      <menu-item v-for="item in menus" :key="item.id" :item="item" />
    </el-menu>
    <div class="right">测试</div>
  </div>
</template>

<script setup lang="ts" name="Header">
import { aonDocmenuTreeApi } from '@/addons/doc/api/aonDoc';
import { PageEnum } from '@/dict/pageEnum';
import { ref } from 'vue';
import MenuItem from './components/menuItem.vue';
const { runAsync } = aonDocmenuTreeApi();
const menus = await runAsync();
const route = useRoute();
const activeMenu = ref('');
watch(
  route,
  (route) => {
    if (route.params) {
      activeMenu.value = route.params.aonDocLabel as string;
    }
  },
  { immediate: true },
);
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
