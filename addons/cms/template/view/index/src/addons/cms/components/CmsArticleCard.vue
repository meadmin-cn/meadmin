<script setup lang="ts">
import { computed } from 'vue';
import CmsIcon from './cmsIcon.vue';
import type { CmsContent } from '../api/cms';

interface Props {
  article: CmsContent;
  categoryName?: string;
  topicName?: string;
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
      <img v-if="article.coverUrl" :src="article.coverUrl" :alt="article.title" class="cover-image" loading="lazy" />
      <div v-else class="cover-placeholder">{{ article.title.slice(0, 1) }}</div>
      <div v-if="article.isDownload || article.orderEnabled" class="card-badges">
        <span v-if="article.isDownload" class="badge badge-download">可下载</span>
        <span v-if="article.orderEnabled" class="badge badge-order">可下单</span>
      </div>
    </div>
    <div class="card-body">
      <div v-if="showCategory && (categoryName || topicName)" class="card-attrs">
        <span v-if="categoryName" class="attr attr-category"><cms-icon name="folder" :size="13" />{{ categoryName }}</span>
        <span v-if="topicName" class="attr attr-topic"><cms-icon name="tag" :size="13" />{{ topicName }}</span>
      </div>
      <h3 class="card-title">{{ article.title }}</h3>
      <p v-if="article.summary" class="card-summary" :title="article.summary">{{ article.summary }}</p>
      <div v-if="tags?.length" class="card-tags">
        <span v-for="tag in tags" :key="tag.id" class="card-tag">#{{ tag.title }}</span>
      </div>
      <div v-if="showMeta" class="card-meta">
        <span v-if="formattedDate" class="card-date"><cms-icon name="calendar" :size="14" />{{ formattedDate }}</span>
        <span class="card-stat"><cms-icon name="view" :size="14" />{{ article.views || 0 }}</span>
        <span class="card-stat"><cms-icon name="like" :size="14" />{{ article.likes || 0 }}</span>
        <span class="card-stat"><cms-icon name="comment" :size="14" />{{ article.comments || 0 }}</span>
      </div>
    </div>
    <span class="card-more" aria-hidden="true"><cms-icon name="arrow-right" :size="18" /></span>
  </article>
</template>

<style scoped>
.cms-article-card {
  display: flex;
  align-items: stretch;
  gap: 16px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e7ebf2;
  border-radius: 12px;
  cursor: pointer;
  transition:
    border-color 0.24s ease,
    box-shadow 0.24s ease,
    transform 0.24s ease;
}
.cms-article-card:hover,
.cms-article-card:focus-visible {
  border-color: #c8d2e2;
  box-shadow: 0 12px 30px rgba(30, 48, 90, 0.1);
  transform: translateY(-2px);
  outline: none;
}
.card-cover {
  position: relative;
  flex: 0 0 208px;
  width: 208px;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 10px;
  background: linear-gradient(135deg, #5b6b86, #3a465c);
}
.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.32s ease;
}
.cms-article-card:hover .cover-image {
  transform: scale(1.06);
}
.cover-placeholder {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.85);
  font-size: 34px;
  font-weight: 700;
}
.card-badges {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 6px;
}
.badge {
  padding: 3px 9px;
  border-radius: 999px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(2px);
}
.badge-download {
  background: rgba(31, 145, 84, 0.92);
}
.badge-order {
  background: rgba(199, 119, 0, 0.92);
}
.card-body {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  padding: 2px 0;
}
.card-attrs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 9px;
}
.attr {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.6;
}
.attr-category {
  color: #454b5c;
  background: #f1f3f7;
}
.attr-topic {
  color: #3a465c;
  background: #eef2f7;
  border: 1px solid #dfe6ef;
}
.card-title {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #202b3d;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.45;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.card-summary {
  display: -webkit-box;
  margin: 8px 0 0;
  overflow: hidden;
  color: #606266;
  font-size: 13px;
  line-height: 1.75;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
.card-tag {
  padding: 2px 8px;
  color: #51647f;
  font-size: 12px;
  line-height: 1.5;
  border: 1px solid #dfe6ef;
  border-radius: 999px;
  background: #f7f9fc;
}
.card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-top: auto;
  padding-top: 12px;
  color: #929baa;
  font-size: 12px;
}
.card-date {
  margin-right: auto;
}
.card-date,
.card-stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.card-more {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  padding-right: 4px;
  color: #c2c9d4;
  transition:
    color 0.24s ease,
    transform 0.24s ease;
}
.cms-article-card:hover .card-more,
.cms-article-card:focus-visible .card-more {
  color: #202b3d;
  transform: translateX(3px);
}
@media (max-width: 640px) {
  .cms-article-card {
    gap: 12px;
    padding: 10px;
  }
  .card-cover {
    flex: 0 0 116px;
    width: 116px;
    aspect-ratio: 4 / 3;
  }
  .card-title {
    font-size: 15px;
    -webkit-line-clamp: 2;
  }
  .card-summary {
    -webkit-line-clamp: 2;
  }
  .card-meta {
    gap: 12px;
  }
  .card-more {
    display: none;
  }
}
</style>
