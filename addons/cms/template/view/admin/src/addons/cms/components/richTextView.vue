<template>
  <div class="rich-text-view" v-html="sanitized"></div>
</template>
<script setup lang="ts">
import { sanitizeCmsHtml } from 'meadmin-addons-cms/preview';
import { computed } from 'vue';
const props = defineProps<{ content?: string | null }>();
const sanitized = computed(() => sanitizeCmsHtml(props.content ?? ''));
</script>
<style scoped>
.rich-text-view {
  line-height: 1.8;
  color: var(--el-text-color-primary);
  word-break: break-word;
  font-size: 14px;
}
.rich-text-view :deep(h1),
.rich-text-view :deep(h2),
.rich-text-view :deep(h3),
.rich-text-view :deep(h4) {
  margin: 18px 0 10px;
  font-weight: 600;
  line-height: 1.4;
}
.rich-text-view :deep(h1) {
  font-size: 22px;
}
.rich-text-view :deep(h2) {
  font-size: 19px;
}
.rich-text-view :deep(h3) {
  font-size: 17px;
}
.rich-text-view :deep(h4) {
  font-size: 15px;
}
.rich-text-view :deep(p) {
  margin: 10px 0;
}
.rich-text-view :deep(a) {
  color: var(--el-color-primary);
  text-decoration: underline;
}
.rich-text-view :deep(ul),
.rich-text-view :deep(ol) {
  padding-left: 22px;
  margin: 10px 0;
}
.rich-text-view :deep(li) {
  margin: 4px 0;
}
.rich-text-view :deep(img) {
  max-width: 100%;
  border-radius: 6px;
  margin: 8px 0;
}
.rich-text-view :deep(blockquote) {
  margin: 12px 0;
  padding: 8px 14px;
  border-left: 3px solid var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  color: var(--el-text-color-regular);
  border-radius: 0 6px 6px 0;
}
.rich-text-view :deep(pre) {
  background: var(--el-fill-color-light);
  padding: 12px 14px;
  border-radius: 6px;
  overflow: auto;
  margin: 12px 0;
}
.rich-text-view :deep(code) {
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--el-font-family-mono, monospace);
}
.rich-text-view :deep(table) {
  border-collapse: collapse;
  margin: 12px 0;
  width: 100%;
}
.rich-text-view :deep(th),
.rich-text-view :deep(td) {
  border: 1px solid var(--el-border-color);
  padding: 6px 10px;
  text-align: left;
}
.rich-text-view :deep(hr) {
  border: none;
  border-top: 1px solid var(--el-border-color-lighter);
  margin: 16px 0;
}
</style>
