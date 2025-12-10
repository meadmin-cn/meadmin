<template>
  <el-config-provider :value-on-clear="() => null">
    <router-view v-slot="{ Component }">
      <template v-if="Component">
        <Suspense @resolve="done()">
          <component :is="Component"></component>
        </Suspense>
      </template>
    </router-view>
    <Suspense>
      <component :is="item.component" v-for="item in globalComponents" :key="item.key"
        :ref="(vnode: any) => item.vnode = vnode" v-bind="item.props"></component>
    </Suspense>
  </el-config-provider>
</template>
<script setup lang="ts">
import { useGlobalStore } from '@/store';
import { done } from '@/utils/nProgress';
const { globalComponents } = toRefs(useGlobalStore());
</script>
<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
