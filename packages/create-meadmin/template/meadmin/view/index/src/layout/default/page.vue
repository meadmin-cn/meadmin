<template>
  <router-view v-slot="{ Component }">
    <Suspense @resolve="done()" @pending="set(1)">
      <component :is="Component"></component>
    </Suspense>
  </router-view>
</template>

<script setup lang="ts" name="LayoutDefaultPage">
import { done, set } from '@/utils/nProgress';
</script>
