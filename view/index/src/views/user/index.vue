<template>
  <div class="index">
    <div class="left-menu">
      <div class="title">个人中心</div>
      <el-menu :default-active="active" class="menu">
        <el-menu-item v-for="item in menuItems" :key="item.key" :index="item.key">
          <component :is="item.icon" v-if="item.icon" />
          <router-link :to="PageEnum.USER + '/' + item.path">{{ item.title }}</router-link>
        </el-menu-item>
        <el-menu-item index="logout">
          <mel-icon-arrow-right></mel-icon-arrow-right>
          <span @click="logOut()">退出</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="right-content">
      <component :is="activeComponent" v-if="activeComponent" />
    </div>
  </div>
</template>

<script setup lang="ts" name="UserIndex">
import { PageEnum } from '@/dict/pageEnum.js';
import { useUserStore } from '@/store/index.js';
import { getUserCenterMenus, type UserCenterMenuItem } from '@/userCenter';
import { computed } from 'vue';
import editPass from './components/editPass.vue';
import userInfo from './components/userInfo.vue';
const userStore = useUserStore();
const props = defineProps<{ active: string }>();
const baseMenus: UserCenterMenuItem[] = [
  { key: 'userInfo', title: '个人资料', path: 'userInfo', component: userInfo, order: 10 },
  { key: 'editPass', title: '修改密码', path: 'editPass', component: editPass, order: 20 },
];
const menuItems = computed(() => [...baseMenus, ...getUserCenterMenus()]);
const activeComponent = computed(() => menuItems.value.find((item) => item.key === props.active)?.component);
const router = useRouter();
const logOut = () => {
  userStore.logOut(router);
};
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
