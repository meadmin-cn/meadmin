<template>
  <div class="index">
    <div class="left-menu">
      <div class="title">个人中心</div>
      <el-menu :default-active="active" class="menu">
        <el-menu-item index="userInfo">
          <mel-icon-user></mel-icon-user>
          <router-link :to="PageEnum.USER + '/userInfo'">个人资料</router-link>
        </el-menu-item>
        <el-menu-item index="editPass">
          <mel-icon-key></mel-icon-key>
          <router-link :to="PageEnum.USER + '/editPass'">修改密码</router-link>
        </el-menu-item>
        <el-menu-item index="logout">
          <mel-icon-arrow-right></mel-icon-arrow-right>
          <span @click="userStore.logOut">退出</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="right-content">
      <user-info v-if="active == 'userInfo'"></user-info>
      <edit-pass v-else-if="active == 'editPass'"></edit-pass>
    </div>
  </div>
</template>

<script setup lang="ts" name="UserIndex">
import { PageEnum } from '@/dict/pageEnum.js';
import { useUserStore } from '@/store/index.js';
import editPass from './components/editPass.vue';
import userInfo from './components/userInfo.vue';
const userStore = useUserStore();
const { active } = defineProps<{
  active: 'userInfo' | 'editPass';
}>();
</script>
<style lang="scss" scoped>
.index {
  padding-top: $page-padding;
  display: flex;
  justify-content: space-between;
  .left-menu {
    width: 200px;
    background-color: #fff;
    .title {
      height: 50px;
      display: flex;
      align-items: center;
      padding-left: 20px;
      color: #9ea2ac;
    }
    .menu {
      border-right: 0;
    }
  }
  .right-content {
    margin-left: 30px;
    flex: 1;
    background-color: #fff;
    padding: $page-padding;
  }
}
</style>
