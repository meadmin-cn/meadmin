<template>
  <div class="layout">
    <div class="layout-header">
      <Header :active="topActiveMenu" :menus="topMenus" :version="version"></Header>
    </div>
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
    <div class="layout-footer">
      <Footer></Footer>
    </div>
  </div>
</template>

<script setup lang="ts" name="docLayout">
import { AonDocMenuTree, aonDocmenuTreeApi } from '../../api/aonDoc';
import Footer from './components/footer.vue';
import Header from './components/header/index.vue';
import MenuItem from './components/menuItem.vue';
import Page from './page.vue';
const { runAsync } = aonDocmenuTreeApi();
const route = useRoute();
const leftMenus = ref<AonDocMenuTree>([]);
const topMenus = reactive<AonDocMenuTree>([]);
const version = ref('');
version.value = route.params.version as string;
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
const getFirstMenu = (item: AonDocMenuTree[0]): AonDocMenuTree[0] => {
  if (!item.children?.length) {
    return item;
  }
  const children = [...item.children];
  const res = { ...item, children: children };
  if (children.length !== 0) {
    return getFirstMenu(children[0]);
  }
  return res;
};
let markdownMenus = [] as { firtstId: string; menus: AonDocMenuTree }[];
const getMenus = async () => {
  markdownMenus = [];
  topMenus.splice(0, topMenus.length);
  leftMenus.value = [];
  const menus = await runAsync(version.value);
  menus.forEach((menu) => {
    if (onlyLink(menu.children)) {
      topMenus.push(menu);
    } else {
      const firstMenu = getFirstMenu(menu);
      topMenus.push(Object.assign({}, menu, { children: [], trueLabel: firstMenu.label || firstMenu.id }));
      markdownMenus.push({ firtstId: menu.id, menus: [menu] });
    }
  });
};
await getMenus();
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
  async (route) => {
    if (route.params) {
      activeMenu.value = route.params.aonDocLabel as string;
      if (route.params.version && version.value != route.params.version) {
        version.value = route.params.version as string;
        await getMenus();
      }
      for (let i = 0; i < markdownMenus.length; i++) {
        if (isActive(markdownMenus[i].menus, activeMenu.value)) {
          topActiveMenu.value = markdownMenus[i].firtstId;
          leftMenus.value = markdownMenus[i].menus;
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
        width: $left-width;
        flex-shrink: 0;
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
