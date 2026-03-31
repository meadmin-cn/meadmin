<template>
  <div class="header">
    <div class="left">
      <router-link :to="PageEnum.HOME">Me - Admin</router-link>
    </div>
    <el-menu :default-active="active" class="menu" mode="horizontal">
      <menu-item v-for="item in menus" :key="item.id" :menu="item" />
    </el-menu>
    <div class="right">
      <div class="version">
        <el-dropdown>
          <span class="el-dropdown-link">
            {{ config?.version.find((v) => v.code === version)?.title || '' }}
            <mel-icon-arrow-down class="el-icon--right" />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="item in config?.version" :key="item.code" @click="toVersion(item.code)">{{ item.title }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div v-for="item in config?.links" :key="item.url" class="right-link">
        <a :href="item.url" target="_blank">
          <img v-if="item.icon?.url" :src="item.icon?.url" class="icon" />
          {{ item.title }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="Header">
import { aonDocConfigApi, AonDocMenuTree } from '@/addons/doc/api/aonDoc';
import { PageEnum } from '@/dict/pageEnum';
import MenuItem from './components/menuItem.vue';
const router = useRouter();
const { runAsync: getConfig, data: config } = await aonDocConfigApi();
await getConfig();
defineProps<{ active: string; menus: AonDocMenuTree; version: string }>();
const toVersion = (version: string) => {
  router.push(`/aon/doc/${version}/`);
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
    display: flex;
    align-items: center;
    > div {
      position: relative;
      padding: 0 10px;
      display: flex;
      align-items: center;
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        height: 30px;
        transform: translateY(-50%);
        width: 1px;
        background-color: var(--el-menu-border-color);
      }
    }
    .right-link {
      a {
        display: flex;
        align-items: center;
      }
      .icon {
        display: inline-block;
        width: 30px;
        height: 30px;
        margin-right: 5px;
      }
    }
  }
  .menu {
    border-bottom: unset;
    flex: 1;
  }
}
</style>
