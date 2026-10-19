<template>
  <div v-if="mounted" class="cms-preview" v-html="sanitized" />
  <pre v-else>{{ content }}</pre>
</template>
<script setup lang="ts">
import { sanitizeCmsHtml } from 'meadmin-addons-cms/preview';
import { computed, onMounted, ref } from 'vue';
const props = defineProps<{ content: string }>();
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});
const sanitized = computed(() => sanitizeCmsHtml(props.content ?? ''));
</script>
<style scoped>
.cms-preview {
  line-height: 1.8;
  color: var(--el-text-color-primary);
  word-break: break-word;
  font-size: 14px;
}
.cms-preview :deep(img) {
  max-width: 100%;
  border-radius: 6px;
}
.cms-preview :deep(table) {
  border-collapse: collapse;
  margin: 12px 0;
  width: 100%;
}
.cms-preview :deep(th),
.cms-preview :deep(td) {
  border: 1px solid var(--el-border-color);
  padding: 6px 10px;
  text-align: left;
}
.cms-preview :deep(pre) {
  background: var(--el-fill-color-light);
  padding: 12px 14px;
  border-radius: 6px;
  overflow: auto;
}
.cms-preview :deep(blockquote) {
  margin: 12px 0;
  padding: 8px 14px;
  border-left: 3px solid var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 0 6px 6px 0;
}
</style>
