<template>
  <template v-if="menu">
    <el-sub-menu v-if="menu.children?.length && !noChild" :index="menu.id">
      <template #title>
        <img v-if="menu.icon" :src="menu.icon.url" />
        <div v-show="collapse" v-else class="icon-text">{{ menu.title.slice(0, 1) }}</div>
        <span class="menu">{{ menu.title }}</span>
      </template>
      <menu-item v-for="child in menu.children" :key="getMenuPath(child)" :item="child"></menu-item>
    </el-sub-menu>
    <template v-else>
      <component :is="truePathMenu!.contentType ? 'a' : 'routerLink'" v-if="menu.title" :href="getMenuPath(truePathMenu!)" :to="getMenuPath(truePathMenu!)">
        <el-menu-item :index="menu.id" :title="menu.title">
          <img v-if="menu.icon" :src="menu.icon.url" />
          <div v-show="collapse" v-else class="icon-text">{{ menu.title.slice(0, 1) }}</div>
          <template #title>
            <span class="menu">{{ menu.title }}</span>
          </template>
        </el-menu-item>
      </component>
    </template>
  </template>
</template>

<script setup lang="ts" name="MenuItem">
import { AonDocMenuTree } from '@/addons/doc/api/aonDoc';
const props = defineProps<{ item: AonDocMenuTree[0]; noChild?: boolean; collapse?: boolean }>();
const menu = ref<AonDocMenuTree[0]>();
const getMenu = (item: AonDocMenuTree[0]): AonDocMenuTree[0] => {
  if (!item.children?.length) {
    return item;
  }
  const children = [...item.children];
  const res = { ...item, children: children };
  if (children.length === 1) {
    return getMenu(children[0]);
  }
  return res;
};
const truePathMenu = ref<AonDocMenuTree[0]>();
truePathMenu.value = menu.value = getMenu(props.item);
if (props.noChild) {
  const firstChildrenMenu: (children: AonDocMenuTree) => AonDocMenuTree[0] | undefined = (children: AonDocMenuTree) => {
    return children[0];
  };
  if (menu.value?.children?.length) {
    truePathMenu.value = firstChildrenMenu(menu.value.children) ?? menu.value;
  }
}
const getMenuPath = (item: AonDocMenuTree[0]) => {
  return item.contentType === 1 ? `/aon/doc/meamdin/${item.id}` : item.link!;
};
</script>
<style lang="scss" scoped>
.icon-text {
  width: 1em;
  text-align: center;
}
</style>
