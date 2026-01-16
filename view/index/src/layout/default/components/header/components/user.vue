<template>
  <div class="user">
    <el-dropdown>
      <span class="el-dropdown-link">
        <el-avatar v-if="userStore.user.id" size="default" class="avatar" :src="userStore.user?.avatar?.url ?? avatar" />
        <template v-else> 会员中心<mel-icon-arrow-down class="icon"></mel-icon-arrow-down> </template>
      </span>
      <template #dropdown>
        <el-dropdown-menu slot="dropdown">
          <template v-if="userStore.user.id">
            <el-dropdown-item>
              <router-link :to="PageEnum.USER">个人中心</router-link>
            </el-dropdown-item>
            <el-dropdown-item>
              <span @click="userStore.logOut">退出登录</span>
            </el-dropdown-item>
          </template>
          <template v-else>
            <el-dropdown-item>
              <router-link :to="PageEnum.LOGIN">登录</router-link>
            </el-dropdown-item>
            <el-dropdown-item>
              <router-link :to="PageEnum.REGISTER">注册</router-link>
            </el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts" name="User">
import avatar from '@/assets/images/avatar.jpg';
import { PageEnum } from '@/dict/pageEnum';
import { useUserStore } from '@/store';
const userStore = useUserStore();
</script>
<style lang="scss" scoped>
.user {
  height: 100%;
  display: flex;
  align-items: center;
  .el-dropdown-link:hover {
    cursor: pointer;
  }
  .icon {
    height: 1.2em;
    margin-left: 5px;
  }
}
</style>
