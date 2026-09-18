<template>
  <div class="layout">
    <div class="layout-header">
      <Header :menus="menus" :active="active">
        <!-- 头部右侧扩展插槽按需透传（不提供时保留 Header 内默认的更新日志） -->
        <template v-if="$slots['header-right']" #right>
          <slot name="header-right"></slot>
        </template>
        <template v-if="$slots['header-mobile-right']" #mobile-right>
          <slot name="header-mobile-right"></slot>
        </template>
      </Header>
    </div>
    <div class="layout-page">
      <div class="page-body" :class="{ full: isFullWidth }">
        <Page></Page>
      </div>
      <div class="layout-footer">
        <Footer></Footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="Layout">
import type { RouteRecordRaw } from 'vue-router';
import Footer from './components/footer.vue';
import Header from './components/header/index.vue';
import Page from './page.vue';

// menus 可由外部（如插件页面）通过 props 传入，替换头部导航菜单；缺省时使用站点动态路由菜单
// active 可传入当前激活菜单路径（如 doc 插件按路由参数计算），缺省时取当前路由 path
defineProps<{ menus?: RouteRecordRaw[]; active?: string }>();

const route = useRoute();
// 首页等落地页需要通栏（整屏背景），由路由 meta.fullWidth 控制
const isFullWidth = computed(() => Boolean(route.meta?.fullWidth));
</script>
<style lang="scss" scoped>
@use './layout.scss' as *;
.layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  .layout-header {
    background-color: #fff;
    width: 100%;
    border-bottom: 1px solid #e8ebf2;
    position: sticky;
    top: 0;
    z-index: 60;
    > div {
      width: $content-width;
      margin: 0 auto;
      max-width: 100%;
      padding: 0 16px;
      box-sizing: border-box;
    }
  }
  .layout-page {
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
    .page-body {
      flex: 1;
      width: $content-width;
      max-width: 100%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      &.full {
        width: 100%;
      }
    }
  }
  .layout-footer {
    background-color: #fff;
    color: #181c28;
    border-top: 1px solid #e8ebf2;
    /* 容器宽度与内边距由 footer 组件内部自管，这里不再干预 */
  }
}
</style>
