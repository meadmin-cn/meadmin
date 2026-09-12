<template>
  <template v-if="menu">
    <!-- 一级菜单（isTop）且 mix 模式：渲染为叶子，点击跳转到第一个子菜单，不展开下拉 -->
    <el-menu-item v-if="isTop && isMixMode && menu.meta && menu.meta.title" :index="menu.path" :title="$t(menu.meta.title)" @click="toTopMenu(menu)">
      <template #title>
        <span>{{ $t(menu.meta.title) }}</span>
      </template>
    </el-menu-item>
    <!-- 一级菜单（isTop）且 top 模式：递归 el-sub-menu，支持多级下拉 -->
    <!-- 侧栏多级菜单（递归） -->
    <el-sub-menu v-else-if="menu.children?.length" :index="menu.path">
      <template v-if="menu.meta" #title>
        <component :is="menu.meta!.icon" v-if="menu.meta!.icon" />
        <!-- 无图标时给默认图标（收起态同样显示，保证与左侧模式收起样式一致） -->
        <component :is="'MelIconList'" v-else class="default-icon" />
        <span class="menu">{{ $t(menu.meta!.title!) }}</span>
      </template>
      <layout-menu-item v-for="child in menu.children" :key="child.path" :item="child"></layout-menu-item>
    </el-sub-menu>
    <template v-else>
      <el-menu-item v-if="menu.meta && menu.meta.title" :index="menu.path" :title="$t(menu.meta.title)" @click="toMenu(truePathMenu || menu)">
        <component :is="menu.meta.icon" v-if="menu.meta.icon" />
        <component :is="'MelIconList'" v-else class="default-icon" />
        <template #title>
          <span class="menu">{{ $t(menu.meta.title) }}</span>
        </template>
      </el-menu-item>
    </template>
  </template>
</template>

<script setup lang="ts" name="MenuItem">
import { useSettingStore } from '@/store';
import type { RouteRecordRaw } from 'vue-router';
const { menuType } = storeToRefs(useSettingStore());
const isMixMode = computed(() => menuType.value === 'mix');
// isTop: 顶部一级菜单
const props = defineProps<{ item: RouteRecordRaw; isTop?: boolean }>();
const menu = ref<RouteRecordRaw>();
const getMenu = (item: RouteRecordRaw): RouteRecordRaw => {
  // 一级菜单且 mix 模式：不折叠，保持顶级结构用于 el-menu index 匹配
  if (props.isTop && isMixMode.value) {
    const children = item.children?.filter((v) => v.meta && !v.meta.hideMenu) ?? [];
    return { ...item, children };
  }
  if (!item.children?.length) {
    return item;
  }
  const children = item.children.filter((v) => v.meta && !v.meta.hideMenu);
  const res = { ...item, children: children };
  if (!item.meta?.alwaysShow && children.length === 1) {
    return getMenu(children[0]);
  }
  return res;
};
const truePathMenu = ref<RouteRecordRaw>();
if (!props.item.meta?.hideMenu) {
  truePathMenu.value = menu.value = getMenu(props.item);
}
const router = useRouter();
const toMenu = (menu: RouteRecordRaw) => {
  if (menu.meta?.isLink) {
    window.open(menu.path, '_blank');
  } else {
    router.push(menu.path);
  }
};
// 无限递归查找第一个可见的最底层页面菜单（第一个子级可能是目录，目录 path 不是可跳转页面）
const findFirstLeaf = (menu: RouteRecordRaw): RouteRecordRaw => {
  const visible = menu.children?.filter((v) => v.meta && !v.meta.hideMenu) ?? [];
  return visible.length ? findFirstLeaf(visible[0]) : menu;
};
// mix 模式一级菜单点击：跳转到最底层第一个可见页面（侧栏联动展示子菜单树），无子菜单则跳自身
const toTopMenu = (menu: RouteRecordRaw) => {
  const target = findFirstLeaf(menu);
  if (target.meta?.isLink) {
    window.open(target.path, '_blank');
  } else {
    router.push(target.path);
  }
};
</script>
