<script setup lang="ts">
import { computed } from 'vue';
import type { CmsContent } from '../api/cms';

interface Props {
  article: CmsContent;
  categoryName?: string;
  showCategory?: boolean;
  showMeta?: boolean;
  tags?: Array<{ id: string; title: string }>;
}

const props = withDefaults(defineProps<Props>(), {
  showCategory: true,
  showMeta: true,
});

const emit = defineEmits<{
  click: [article: CmsContent];
}>();

const formattedDate = computed(() => {
  if (!props.article.publishAt) return '';
  return new Date(props.article.publishAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
});
</script>

<template>
  <article class="cms-article-card" tabindex="0" @click="emit('click', article)" @keyup.enter="emit('click', article)">
    <div class="card-cover">
      <img v-if="article.coverUrl" :src="article.coverUrl" :alt="article.title" class="cover-image" />
      <div v-else class="cover-placeholder">暂无图片</div>
    </div>
    <div class="card-content">
      <div v-if="showCategory && categoryName" class="meta-category">{{ categoryName }}</div>
      <h3 class="card-title">{{ article.title }}</h3>
      <p v-if="article.summary" class="card-summary">{{ article.summary }}</p>
      <div v-if="tags?.length" class="card-tags">
        <span v-for="tag in tags" :key="tag.id">{{ tag.title }}</span>
      </div>
      <div v-if="showMeta" class="card-meta">
        <span>{{ formattedDate }}</span>
        <span>浏览 {{ article.views || 0 }}</span>
        <span>点赞 {{ article.likes || 0 }}</span>
        <span>评论 {{ article.comments || 0 }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.cms-article-card {
  display: flex;
  min-height: 148px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e7eaf0;
  border-radius: 6px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}
.cms-article-card:hover,
.cms-article-card:focus-visible {
  border-color: #b7d4f8;
  box-shadow: 0 8px 24px rgba(31, 45, 61, 0.09);
  outline: none;
  transform: translateY(-2px);
}
.card-cover {
  flex: 0 0 180px;
  overflow: hidden;
  background: #f2f4f7;
}
.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.cms-article-card:hover .cover-image {
  transform: scale(1.04);
}
.cover-placeholder {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: #a8abb2;
  font-size: 13px;
}
.card-content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  padding: 16px 18px;
}
.meta-category {
  align-self: flex-start;
  margin-bottom: 9px;
  padding: 3px 8px;
  border-radius: 3px;
  background: #ecf5ff;
  color: #337ecc;
  font-size: 12px;
}
.card-title {
  margin: 0;
  overflow: hidden;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-summary {
  display: -webkit-box;
  margin: 10px 0 16px;
  overflow: hidden;
  color: #606266;
  font-size: 14px;
  line-height: 1.7;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: -4px 0 12px;
}
.card-tags span {
  padding: 3px 8px;
  color: #51647f;
  font-size: 12px;
  line-height: 1.4;
  border: 1px solid #dfe6ef;
  border-radius: 999px;
  background: #f7f9fc;
}
.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: auto;
  color: #909399;
  font-size: 12px;
}
@media (max-width: 720px) {
  .cms-article-card {
    min-height: 0;
    flex-direction: column;
  }
  .card-cover {
    flex: none;
    width: 100%;
    aspect-ratio: 16 / 9;
  }
  .card-content {
    padding: 16px;
  }
  .card-title {
    white-space: normal;
  }
}
</style>
