<template>
  <div class="left">
    <Expand></Expand>
    <div v-if="showBreadcrumb" class="breadcrumb-wrap">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="item.path" :to="index === breadcrumbList.length - 1 || !item.redirect ? undefined : item">{{ $t(item.meta!.title!) }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
  </div>
</template>
<script setup lang="ts" name="Left">
import { event, mitter } from '@/event';
import Expand from '@/layout/components/expand.vue';
import { useGlobalStore, useRouteStore, useSettingStore } from '@/store';
import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
const { themeConfig, menuType } = storeToRefs(useSettingStore());
const globalStore = useGlobalStore();
const showBreadcrumb = computed(() => !globalStore.isMobile && themeConfig.value.breadcrumb && menuType.value === 'sidebar');
const breadcrumbList = ref([] as Pick<RouteRecordRaw, 'name' | 'path' | 'meta' | 'redirect'>[]);
const route = useRoute();
const { routes } = storeToRefs(useRouteStore());
const setBreadcrumbList = (route: RouteLocationNormalized) => {
  const list = [] as Pick<RouteRecordRaw, 'name' | 'path' | 'meta' | 'redirect'>[];
  let temp = { children: routes.value } as unknown as RouteRecordRaw;
  route.meta.menuIndex!.forEach((item) => {
    temp = temp.children![item];
    if (temp.meta?.title && temp.meta.breadcrumb !== false && (temp.meta.breadcrumb || temp.children?.filter((v) => v.meta?.breadcrumb !== false).length !== 1)) {
      list.push({
        name: temp.name,
        path: temp.path,
        meta: temp.meta,
        redirect: temp.redirect === route.path ? undefined : temp.redirect,
      });
    }
  });
  breadcrumbList.value = list;
};
setBreadcrumbList(route);
mitter.on(event.BEFORE_ROUTE_CHANGE, ({ to }) => setBreadcrumbList(to), true);
</script>
<style lang="scss" scoped>
// 设计稿 .topbar：☰ 与面包屑间距 10px（用普通 flex 保证间距确定性）
.left {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 10px;

  // ☰ 折叠图标（设计稿 v1.4 .tb-icon）：30x30 圆角方块，垂直居中，hover 浅灰底
  :deep(.expand-wrap) {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    font-size: 16px;
    flex-shrink: 0;
    color: var(--el-text-color-regular);
  }
  :deep(.expand-wrap:hover) {
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-primary);
  }

  .breadcrumb-wrap {
    min-width: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  &:deep(.el-breadcrumb) {
    white-space: nowrap;
  }

  // 设计稿 .tb-crumb：父级浅灰 #8a93a6，当前页深色 600
  &:deep(.el-breadcrumb__inner) {
    color: var(--el-text-color-secondary);
    font-weight: normal;
  }
  &:deep(.el-breadcrumb__inner.is-link):hover {
    color: var(--el-color-primary);
  }
  &:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner),
  &:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner:hover) {
    color: var(--el-text-color-primary);
    font-weight: 600;
  }
  // 分隔线：Element 默认 700 字重偏深，改细并降色阶
  &:deep(.el-breadcrumb__separator) {
    color: var(--el-text-color-disabled);
    font-weight: 400;
  }
}
</style>
