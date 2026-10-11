<template>
  <router-view v-slot="{ Component }">
    <!-- 异步页面切换时立即清空旧视图，避免旧页面按新路由参数重绘出首页。 -->
    <Suspense :timeout="0" @resolve="done()" @pending="set(1)">
      <component :is="Component"></component>
      <template #fallback><div aria-hidden="true"></div></template>
    </Suspense>
  </router-view>
</template>

<script setup lang="ts" name="LayoutDefaultPage">
import { done, set } from '@/utils/nProgress';
</script>
