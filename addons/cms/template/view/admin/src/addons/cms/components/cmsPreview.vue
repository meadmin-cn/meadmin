<template>
  <MdPreview v-if="mounted" :model-value="content" :sanitize="sanitizeCmsHtml" :theme="dark ? 'dark' : 'light'" :no-mermaid="true" :no-katex="true" />
  <pre v-else>{{ content }}</pre>
</template>
<script setup lang="ts">
import { useDark } from '@vueuse/core';
import { MdPreview, sanitizeCmsHtml } from 'meadmin-addons-cms/preview';
import { onMounted, ref } from 'vue';
defineProps<{ content: string }>();
const mounted = ref(false);
const dark = useDark();
onMounted(() => {
  mounted.value = true;
});
</script>
