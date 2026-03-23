<template>
  <div class="layout">
    <div class="layout-header">
      <Header :active="topActiveMenu" :menus="topMenus"></Header>
    </div>
    <div class="layout-page">
      <div class="content">
        <div class="left-menu">
          <el-menu :default-active="activeMenu" class="menu">
            <menu-item v-for="item in letMenus" :key="item.id" :menu="item" />
          </el-menu>
        </div>
        <Page>
          <slot></slot>
        </Page>
      </div>
    </div>
    <div class="layout-footer">
      <Footer></Footer>
    </div>
  </div>
</template>

<script setup lang="ts" name="Index">
import { AonDocMenuTree, aonDocmenuTreeApi } from '../../api/aonDoc';
import Footer from './components/footer.vue';
import Header from './components/header/index.vue';
import MenuItem from './components/menuItem.vue';
import Page from './page.vue';
const { runAsync } = aonDocmenuTreeApi();
const menus = await runAsync();
const letMenus = ref<AonDocMenuTree>([]);
const topMenus = reactive<AonDocMenuTree>([]);
//是否全是外链
const onlyLink = (menu: AonDocMenuTree) => {
  for (let i = 0; i < menu.length; i++) {
    if (menu[i].contentType === 0) {
      //markdown;
      return false;
    }
    if (menu[i].children.length) {
      if (!onlyLink(menu[i].children)) {
        return false;
      }
    }
  }
  return true;
};
const getFisrtMenu = (item: AonDocMenuTree[0]): AonDocMenuTree[0] => {
  if (!item.children?.length) {
    return item;
  }
  const children = [...item.children];
  const res = { ...item, children: children };
  if (children.length === 1) {
    return getFisrtMenu(children[0]);
  }
  return res;
};
const markdownMenus = [] as { firtstId: string; menus: AonDocMenuTree }[];
menus.forEach((menu) => {
  if (onlyLink(menu.children)) {
    topMenus.push(menu);
  } else {
    const firstMenu = getFisrtMenu(menu);
    topMenus.push(Object.assign({}, menu, { children: [], trueLabel: firstMenu.label || firstMenu.id }));
    markdownMenus.push({ firtstId: menu.id, menus: [menu] });
  }
});
const route = useRoute();
const activeMenu = ref('');
const topActiveMenu = ref('');
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
watch(
  route,
  (route) => {
    if (route.params) {
      activeMenu.value = route.params.aonDocLabel as string;
      for (let i = 0; i < markdownMenus.length; i++) {
        if (isActive(markdownMenus[i].menus, activeMenu.value)) {
          topActiveMenu.value = markdownMenus[i].firtstId;
          letMenus.value = markdownMenus[i].menus;
          break;
        }
      }
    }
  },
  { immediate: true },
);
</script>
<style lang="scss" scoped>
@use './layout.scss' as *;
.layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
  .layout-header {
    background-color: #fff;
    width: 100%;
    border-bottom: 1px solid #dcdfe6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 2;
    > div {
      width: $content-width;
      margin: 0 auto;
      max-width: 100%;
    }
  }
  .layout-page {
    flex: 1;
    overflow: auto;
    position: relative;

    .content {
      position: absolute;
      height: 100%;
      width: $content-width;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      .left-menu {
        width: 300px;
        height: 100%;
        .menu {
          min-height: 100%;
        }
      }
    }
  }
  .layout-footer {
    position: sticky;
    bottom: 0;
    z-index: 2;
    background-color: #1a2027;
    color: #ede5e5;
    > div {
      width: $content-width;
      max-width: 100%;
      margin: 0 auto;
    }
  }
}
</style>
