<template>
<layout v-loading="loading">
  <div class="doc">
    111
  </div>
</layout>
</template>

<script setup lang="ts" name="Doc">
import { aonDocGetContentApi } from '../api/aonDoc';
import Layout from './components/index.vue';
const props = defineProps<{
  aonDocType:string;
  aonDocLabel:string;//文档标识（文档id）
}>();
const {runAsync,data,loading} = aonDocGetContentApi()
await runAsync(props.aonDocLabel)
watch(()=>props.aonDocLabel,async ()=>{
  await runAsync(props.aonDocLabel);
}); 
</script>
<style lang="scss" scoped>
.doc{

}
</style>