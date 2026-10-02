<template>
  <!-- title 属性：鼠标移入时以浏览器原生提示展示区块标题，便于快速识别当前内容属于哪个区块 -->
  <div v-if="mounted && isHtml" class="cms-html" :title="title || undefined" v-html="sanitized" />
  <MdPreview v-else-if="mounted" :model-value="content" :sanitize="sanitizeCmsHtml" :theme="dark ? 'dark' : 'light'" :no-mermaid="true" :no-katex="true" />
  <pre v-else :title="title || undefined">{{ content }}</pre>
</template>
<script setup lang="ts">
import { useDark } from '@vueuse/core';
import { MdPreview, sanitizeCmsHtml } from 'meadmin-addons-cms/preview';
import { computed, onMounted, ref } from 'vue';
const props = defineProps<{ content: string; title?: string }>();
const mounted = ref(false);
const dark = useDark();
onMounted(() => {
  mounted.value = true;
});
// 后台使用 wangEditor 保存的是 HTML（不再生成 Markdown）。以内容特征判断渲染方式：只要出现 HTML 标签即按 HTML 渲染，
// 否则回退 Markdown（兼容极少数旧数据）。避免误把 HTML 当文本或当 Markdown 转义破坏富文本。
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
