<template>
<div class="header">
 <div class="left">
  <router-link :to="PageEnum.HOME">Me - Admin</router-link> </div>
 <el-menu
    :default-active="activeIndex"
    class="menu"
    mode="horizontal"
    @select="handleSelect"
  >
    <el-menu-item index="1">Processing Center</el-menu-item>
    <el-sub-menu index="2">
      <template #title>Workspace</template>
      <el-menu-item index="2-1">item one</el-menu-item>
      <el-menu-item index="2-2">item two</el-menu-item>
      <el-menu-item index="2-3">item three</el-menu-item>
      <el-sub-menu index="2-4">
        <template #title>item four</template>
        <el-menu-item index="2-4-1">item one</el-menu-item>
        <el-menu-item index="2-4-2">item two</el-menu-item>
        <el-menu-item index="2-4-3">item three</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
 </el-menu>
 <div class="right">
  <User></User>
 </div>
</div>
</template>

<script setup lang="ts" name="Header">
import { ref } from 'vue'
import User from './user.vue';
import {PageEnum} from '@/dict/pageEnum';
const activeIndex = ref('1')
const activeIndex2 = ref('1')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>
<style lang="scss" scoped>

.header{
  display: flex;
  .left{
    padding-right: 5px;
    font-size: 20px;
    display: flex;
    align-items: center;
  }
  .right{
  }
  .menu{
    border-bottom: unset;
    flex: 1;

  }
}
</style>