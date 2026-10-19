<template>
  <!-- title 属性：鼠标移入时以浏览器原生提示展示区块标题，便于快速识别当前内容属于哪个区块 -->
  <div v-if="mounted && isHtml" class="cms-html" :title="title || undefined" v-html="sanitized" />
  <pre v-else :title="title || undefined">{{ content }}</pre>
</template>
<script setup lang="ts">
import { sanitizeCmsHtml } from 'meadmin-addons-cms/preview';
import { computed, onMounted, ref } from 'vue';
const props = defineProps<{ content: string; title?: string }>();
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});
// 正文由 wangEditor 富文本保存为 HTML，直接以 HTML 渲染；无标签则按纯文本兜底。
const isHtml = computed(() => /<[a-zA-Z][^>]{0,80}>/.test(props.content));
const sanitized = computed(() => sanitizeCmsHtml(props.content));
</script>
<style scoped>
.cms-html {
  line-height: 1.75;
  color: #2b3445;
  font-size: 15px;
  word-break: break-word;
}
.cms-html :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
}
.cms-html :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
}
.cms-html :deep(th),
.cms-html :deep(td) {
  border: 1px solid #e5e8ec;
  padding: 6px 10px;
}
.cms-html :deep(a) {
  color: #202b3d;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.cms-html :deep(h1),
.cms-html :deep(h2),
.cms-html :deep(h3) {
  margin: 18px 0 10px;
  line-height: 1.4;
}
.cms-html :deep(pre) {
  background: #f6f8fa;
  padding: 12px;
  border-radius: 6px;
  overflow: auto;
}
.cms-html :deep(code) {
  background: #f1f3f5;
  padding: 1px 5px;
  border-radius: 4px;
}
.cms-html :deep(blockquote) {
  border-left: 3px solid #d7dde5;
  margin: 12px 0;
  padding: 4px 14px;
  color: #66707d;
}
</style>
