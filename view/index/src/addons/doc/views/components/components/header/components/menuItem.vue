<template>
  <template v-if="menu">
    <el-sub-menu v-if="menu.children?.length" :index="menu.id">
      <template #title>
        <img v-if="menu.icon" :src="menu.icon.url" />
        <div v-show="collapse" v-else class="icon-text">{{ menu.title.slice(0, 1) }}</div>
        <span class="menu">{{ menu.title }}</span>
      </template>
      <menu-item v-for="child in menu.children" :key="getMenuPath(child)" :item="child"></menu-item>
    </el-sub-menu>
    <template v-else>
      <el-menu-item :index="menu.id" :title="menu.title" @click="toMenu(menu)">
        <img v-if="menu.icon" :src="menu.icon.url" />
        <div v-show="collapse" v-else class="icon-text">{{ menu.title.slice(0, 1) }}</div>
        <template #title>
          <span class="menu">{{ menu.title }}</span>
        </template>
      </el-menu-item>
    </template>
  </template>
</template>

<script setup lang="ts" name="MenuItem">
import { AonDocMenuTree } from '@/addons/doc/api/aonDoc';
const props = defineProps<{ item: AonDocMenuTree[0]; collapse?: boolean }>();
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
menu.value = getMenu(props.item);
const getMenuPath = (item: AonDocMenuTree[0]) => {
  return item.contentType === 1 ? `/aon/doc/meamdin/${item.id}` : item.link!;
};
const router = useRouter();
const toMenu = (menu: AonDocMenuTree[0]) => {
  if (menu.contentType === 1) {
    window.open(menu.link!, '_blank');
  } else {
    router.push(getMenuPath(menu));
  }
};
</script>
<style lang="scss" scoped>
.icon-text {
  width: 1em;
  text-align: center;
}
a {
  display: block;
  height: 100%;
}
</style>
