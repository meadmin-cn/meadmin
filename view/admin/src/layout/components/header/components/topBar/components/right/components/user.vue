<template>
  <el-dropdown class="me-size-select" trigger="click" max-height="500px">
    <div class="flex-center pointer" v-bind="$attrs">
      <el-avatar :size="28" class="avatar" :src="userStore.user?.avatar?.url" />
      <span v-if="!globalStore.isMobile" class="ellipsis-2 nickname">{{ userStore.user.nickname }}</span>
    </div>
    <template #dropdown>
      <el-dropdown-item @click="openProfile()">{{ $t('个人中心') }}</el-dropdown-item>
      <el-dropdown-menu>
        <router-link to="/">
          <el-dropdown-item>
            {{ $t('首页') }}
          </el-dropdown-item>
        </router-link>
        <a target="_blank" href="https://github.com/meadmin-cn/meadmin">
          <el-dropdown-item>
            {{ $t('Github') }}
          </el-dropdown-item>
        </a>
        <a target="_blank" href="https://www.meadmin.cn/">
          <el-dropdown-item>
            {{ $t('文档') }}
          </el-dropdown-item>
        </a>
        <el-dropdown-item divided @click="userStore.logOut()">
          {{ $t('退出登录') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts" name="User">
import { useActionModel } from '@/hooks/actionModel.js';
import { useGlobalStore, useUserStore } from '@/store';
import Profile from './profile.vue';
const { open: openProfile } = useActionModel(Profile);
const userStore = useUserStore();
const globalStore = useGlobalStore();
</script>
<style lang="scss" scoped>
.flex-center {
  max-width: 160px;
  gap: 9px;

  .avatar {
    flex-shrink: 0;
  }

  // 设计稿 .tb-avatar：linear-gradient(135deg,#2b5cff,#6f9bff) 白字首字母
  .avatar-initials {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--el-color-primary), color-mix(in srgb, var(--el-color-primary) 55%, #fff));
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // 设计稿 .tb-user span：13px、600
  .nickname {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-left: 0;
  }
}
</style>
