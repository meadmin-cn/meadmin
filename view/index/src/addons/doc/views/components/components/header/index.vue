<template>
  <div class="header">
    <div class="left">
      <router-link :to="PageEnum.HOME">Me - Admin</router-link>
    </div>
    <el-menu :default-active="active" class="menu" mode="horizontal">
      <menu-item v-for="item in menus" :key="item.id" :menu="item" />
    </el-menu>
    <div class="right">测试</div>
  </div>
</template>

<script setup lang="ts" name="Header">
import { aonDocmenuTreeApi } from '@/addons/doc/api/aonDoc';
import { PageEnum } from '@/dict/pageEnum';
import MenuItem from './components/menuItem.vue';
const { runAsync } = aonDocmenuTreeApi();
const menus = await runAsync();
defineProps<{active:string}>();
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
