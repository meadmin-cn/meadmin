<template>
  <router-view v-slot="{ Component }">
    <template v-if="Component">
      <Suspense @resolve="done()">
        <component :is="Component"></component>
      </Suspense>
    </template>
  </router-view>
</template>

<script setup lang="ts" name="LayoutDefaultPage">
import { done } from '@/utils/nProgress';
</script>
