<template>
  <div class="page-info">
    <h3 v-if="showTitle && page.title" class="info-title">{{ page.title }}</h3>
    <el-descriptions :column="2" border class="info-desc">
      <el-descriptions-item v-if="page.status !== undefined" label="状态">
        <el-tag :type="(['info', 'warning', 'success', 'danger', 'info'] as const)[page.status] ?? 'info'">{{ states[page.status] ?? page.status }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item v-if="page.slug !== undefined" label="SEO 标识">{{ page.slug || '—' }}</el-descriptions-item>
      <el-descriptions-item v-if="page.kind !== undefined" label="页面类型">
        <el-tag :type="page.kind === 2 ? 'warning' : 'success'" size="small" effect="light">{{ page.kind === 2 ? '外部链接' : '站内内容' }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item v-if="page.target !== undefined" label="打开方式">{{ page.target === '_blank' ? '新窗口打开' : '当前窗口打开' }}</el-descriptions-item>
      <el-descriptions-item v-if="page.link" label="外链地址">
        <el-link :href="page.link" target="_blank" type="primary">{{ page.link }}</el-link>
      </el-descriptions-item>
      <el-descriptions-item label="发布时间">{{ page.publishAt ? formatterAtExec(page.publishAt) : '未发布' }}</el-descriptions-item>
      <el-descriptions-item v-if="page.orderNum !== undefined" label="排序">{{ page.orderNum }}</el-descriptions-item>
      <el-descriptions-item v-if="page.createdAt" label="创建时间">{{ formatterAtExec(page.createdAt) }}</el-descriptions-item>
      <el-descriptions-item v-if="page.updatedAt" label="更新时间">{{ formatterAtExec(page.updatedAt) }}</el-descriptions-item>
      <el-descriptions-item v-if="page.seoTitle !== undefined" label="SEO 标题" :span="2">{{ page.seoTitle || '—' }}</el-descriptions-item>
      <el-descriptions-item v-if="page.seoKeywords !== undefined" label="SEO 关键词" :span="2">{{ page.seoKeywords || '—' }}</el-descriptions-item>
      <el-descriptions-item v-if="page.seoDescription !== undefined" label="SEO 描述" :span="2">{{ page.seoDescription || '—' }}</el-descriptions-item>
    </el-descriptions>

    <template v-if="showCover">
      <div class="info-block-label">封面</div>
      <div class="info-cover">
        <el-image v-if="page.coverUrl" :src="page.coverUrl" :preview-src-list="[page.coverUrl]" fit="cover" preview-teleported class="info-cover-img" />
        <span v-else class="info-empty">未设置封面</span>
      </div>
    </template>

    <template v-if="page.summary !== undefined">
      <div class="info-block-label">摘要</div>
      <div class="info-summary">{{ page.summary || '暂无摘要' }}</div>
    </template>

    <template v-if="showBody">
      <div class="info-block-label">正文</div>
      <div class="info-body" :style="{ maxHeight: bodyMaxHeight }">
        <RichTextView :content="page.mdContent" />
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { formatterAtExec } from '@/utils/helper';
import RichTextView from '../../../components/richTextView.vue';
const states = ['草稿', '待审核', '发布', '拒绝', '下线'];
withDefaults(defineProps<{ page: Record<string, any>; showTitle?: boolean; showCover?: boolean; showBody?: boolean; bodyMaxHeight?: string }>(), { showTitle: false, showCover: true, showBody: true, bodyMaxHeight: '52vh' });
</script>
<style scoped>
.page-info {
  min-width: 0;
}
.info-title {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.info-desc {
  margin-bottom: 14px;
}
.info-empty {
  color: var(--el-text-color-placeholder);
}
.info-block-label {
  margin: 14px 0 8px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.info-cover-img {
  width: 240px;
  max-width: 100%;
  height: 150px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
}
.info-summary {
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color-page);
  color: var(--el-text-color-regular);
  line-height: 1.7;
}
.info-body {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  background: var(--el-bg-color-page);
  overflow: auto;
}
</style>
