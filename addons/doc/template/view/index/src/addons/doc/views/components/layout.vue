<template>
  <Layout :menus="headerMenus" :active="activeMenu">
    <!-- 右侧扩展区：版本切换 + 配置外链，替换默认的“更新日志” -->
    <template #header-right>
      <HeaderRight :config="config" :version="version" />
    </template>
    <template #header-mobile-right>
      <HeaderRight :config="config" :version="version" mobile />
    </template>
  </Layout>
</template>

<script setup lang="ts" name="AonDocLayout">
import Layout from '@/layout/default/index.vue';
import type { RouteRecordRaw } from 'vue-router';
import type { AonDocMenuTree } from '../../api/aonDoc';
import { aonDocConfigApi, aonDocmenuTreeApi } from '../../api/aonDoc';
import { aonDocContextKey } from '../context';
import HeaderRight from './headerRight.vue';

const route = useRoute();
const { runAsync: menuTreeRun } = aonDocmenuTreeApi();
const { runAsync: configRun, data: config } = aonDocConfigApi();

const version = ref((route.params.version as string) || '');
const menus = ref<AonDocMenuTree>([]);

const getMenus = async () => {
  menus.value = (await menuTreeRun(version.value || undefined)) || [];
};
await Promise.all([getMenus(), configRun()]);

// 路由版本切换时重新拉取菜单
watch(
  () => route.params.version,
  async (val) => {
    const newVersion = (val as string) || '';
    if (newVersion !== version.value) {
      version.value = newVersion;
      await getMenus();
    }
  },
);

// doc 菜单树 → 站点 layout 导航菜单（RouteRecordRaw 结构）：markdown 走站内路由，外链新窗口打开
const toRouteMenus = (list: AonDocMenuTree): RouteRecordRaw[] =>
  list.map(
    (menu) =>
      ({
        path: menu.contentType === 1 ? menu.link || '/' : `/aon/doc/${menu.version}/${menu.label || menu.id}`,
        meta: { title: menu.title, isLink: menu.contentType === 1, alwaysShow: true },
        children: menu.children?.length ? toRouteMenus(menu.children) : [],
      }) as RouteRecordRaw,
  );
const headerMenus = computed(() => toRouteMenus(menus.value));

// 当前文档对应的菜单路径，传给主 layout 做导航高亮（直接访问文档链接时也能定位激活菜单）
const activeMenu = computed(() => {
  const label = route.params.aonDocLabel as string;
  return label ? `/aon/doc/${version.value}/${label}` : '';
});

// 共享给内层布局（左侧菜单）与文档页，避免重复请求
provide(aonDocContextKey, { menus, version, config });
</script>
<style lang="scss" scoped></style>
