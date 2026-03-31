<template>
  <Suspense @resolve="done()" @pending="set(1)">
      <slot></slot>
  </Suspense>
</template>

<script setup lang="ts" name="LayoutDefaultPage">
import { done, set } from '@/utils/nProgress';
</script>
