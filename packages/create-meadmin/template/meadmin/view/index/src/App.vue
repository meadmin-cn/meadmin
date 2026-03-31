<template>
  <el-config-provider :value-on-clear="() => null">
    <router-view v-slot="{ Component }">
      <Suspense @resolve="done()" @pending="set(1)">
        <component :is="Component"></component>
      </Suspense>
    </router-view>
    <Teleport to="body">
      <Suspense>
        <component :is="item.component" v-for="item in globalComponents" :key="item.key" :ref="(vnode: any) => (item.vnode = vnode)" v-bind="item.props"></component>
      </Suspense>
    </Teleport>
  </el-config-provider>
</template>
<script setup lang="ts">
import { useGlobalStore } from '@/store';
import { done, set } from '@/utils/nProgress';
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
