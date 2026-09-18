<template>
  <div class="layout">
    <div class="layout-page">
      <div class="content">
        <div class="left-menu">
          <el-menu :default-active="activeMenu" class="menu">
            <menu-item v-for="item in leftMenus" :key="item.id" :menu="item" />
          </el-menu>
        </div>
        <Page>
          <slot></slot>
        </Page>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="AonDocPageLayout">
import type { AonDocMenuTree } from '../../api/aonDoc';
import { aonDocContextKey } from '../context';
import MenuItem from './components/menuItem.vue';
import Page from './page.vue';

const route = useRoute();
// 菜单/版本由外层 layout.vue 统一请求并共享（顶部导航已移到站点主 layout，这里只保留左侧菜单）
const { menus } = inject(aonDocContextKey)!;

const activeMenu = ref('');
const leftMenus = ref<AonDocMenuTree>([]);

const isActive = (menu: AonDocMenuTree, activeLabel: string) => {
  for (let i = 0; i < menu.length; i++) {
    if (menu[i].label === activeLabel || menu[i].id === activeLabel) {
      //markdown;
      return true;
    }
    if (menu[i].children.length) {
      if (isActive(menu[i].children, activeLabel)) {
        return true;
      }
    }
  }
  return false;
};

// 根据当前文档标识定位所属顶级菜单，其子树作为左侧菜单
const updateLeftMenus = () => {
  activeMenu.value = (route.params.aonDocLabel as string) || '';
  leftMenus.value = [];
  if (!activeMenu.value) {
    return;
  }
  for (let i = 0; i < menus.value.length; i++) {
    if (isActive([menus.value[i]], activeMenu.value)) {
      leftMenus.value = [menus.value[i]];
      break;
    }
  }
};
watch([() => route.params.aonDocLabel, menus], updateLeftMenus, { immediate: true });
</script>
<style lang="scss" scoped>
@use './layout.scss' as *;
.layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
  .layout-page {
    flex: 1;
    position: relative;
    .content {
      position: absolute;
      height: 100%;
      width: $content-width;
      max-width: 100%;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      .left-menu {
        width: $left-width;
        flex-shrink: 0;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        .menu {
          min-height: 100%;

          :deep(.el-menu-item) {
            width: $left-width;
            align-items: center;
            line-height: 1.2em;
            white-space: normal;
          }
        }
      }
    }
    /* 手机端：隐藏左侧树状快捷菜单，内容区全宽 */
    @media (max-width: 960px) {
      .content {
        width: 100%;
        .left-menu {
          display: none;
        }
      }
    }
  }
}
</style>
