<template>
  <div class="article-info">
    <h3 v-if="showTitle && article.title" class="info-title">{{ article.title }}</h3>
    <div v-if="statItems.length" class="info-stats">
      <div v-for="item in statItems" :key="item.label" class="info-stat">
        <span class="info-stat-value">{{ item.value }}</span>
        <span class="info-stat-label">{{ item.label }}</span>
      </div>
    </div>
    <el-descriptions :column="2" border class="info-desc">
      <el-descriptions-item v-if="article.status !== undefined" label="状态">
        <el-tag :type="(['info', 'warning', 'success', 'danger', 'info'] as const)[article.status] ?? 'info'">{{ states[article.status] ?? article.status }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item v-if="article.slug !== undefined" label="SEO 标识">{{ article.slug || '—' }}</el-descriptions-item>
      <el-descriptions-item label="栏目">{{ categoryText }}</el-descriptions-item>
      <el-descriptions-item label="专题">{{ topicText }}</el-descriptions-item>
      <el-descriptions-item label="标签">
        <template v-if="tagTexts.length"
          ><el-tag v-for="(tag, i) in tagTexts" :key="i" size="small" effect="light" class="info-tag">{{ tag }}</el-tag></template
        >
        <span v-else class="info-empty">未设置</span>
      </el-descriptions-item>
      <el-descriptions-item label="发布时间">{{ article.publishAt ? formatterAtExec(article.publishAt) : '未发布' }}</el-descriptions-item>
      <el-descriptions-item v-if="article.orderNum !== undefined" label="排序">{{ article.orderNum }}</el-descriptions-item>
      <el-descriptions-item v-if="article.createdAt" label="创建时间">{{ formatterAtExec(article.createdAt) }}</el-descriptions-item>
      <el-descriptions-item v-if="article.updatedAt" label="更新时间">{{ formatterAtExec(article.updatedAt) }}</el-descriptions-item>
      <el-descriptions-item label="是否可下载">
        <el-tag :type="article.isDownload ? 'success' : 'info'" size="small" effect="light">{{ article.isDownload ? '可下载' : '不可下载' }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="下载文件">
        <template v-if="article.isDownload && article.fileUrl">
          <el-link :href="article.fileUrl" target="_blank" type="primary">{{ article.fileName || article.fileUrl }}</el-link>
        </template>
        <span v-else class="info-empty">—</span>
      </el-descriptions-item>
      <el-descriptions-item label="是否可下单">
        <el-tag :type="article.orderEnabled ? 'warning' : 'info'" size="small" effect="light">{{ article.orderEnabled ? '可下单' : '不可下单' }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="图集精选">
        <el-tag :type="article.isGallery ? 'success' : 'info'" size="small" effect="light">{{ article.isGallery ? '是' : '否' }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item v-if="article.seoTitle !== undefined" label="SEO 标题" :span="2">{{ article.seoTitle || '—' }}</el-descriptions-item>
      <el-descriptions-item v-if="article.seoKeywords !== undefined" label="SEO 关键词" :span="2">{{ article.seoKeywords || '—' }}</el-descriptions-item>
      <el-descriptions-item v-if="article.seoDescription !== undefined" label="SEO 描述" :span="2">{{ article.seoDescription || '—' }}</el-descriptions-item>
    </el-descriptions>

    <template v-if="showCover">
      <div class="info-block-label">封面</div>
      <div class="info-cover">
        <el-image v-if="article.coverUrl" :src="article.coverUrl" :preview-src-list="[article.coverUrl]" fit="cover" preview-teleported class="info-cover-img" />
        <span v-else class="info-empty">未设置封面</span>
      </div>
    </template>

    <template v-if="article.summary !== undefined">
      <div class="info-block-label">摘要</div>
      <div class="info-summary">{{ article.summary || '暂无摘要' }}</div>
    </template>

    <template v-if="showBody">
      <div class="info-block-label">正文</div>
      <div class="info-body" :style="{ maxHeight: bodyMaxHeight }">
        <RichTextView :content="article.mdContent" />
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { formatterAtExec } from '@/utils/helper';
import { computed } from 'vue';
import RichTextView from '../../../components/richTextView.vue';
const states = ['草稿', '待审核', '发布', '拒绝', '下线'];
const props = withDefaults(defineProps<{ article: Record<string, any>; categories?: any[]; tags?: any[]; showTitle?: boolean; showCover?: boolean; showBody?: boolean; bodyMaxHeight?: string }>(), { showTitle: false, showCover: true, showBody: true, bodyMaxHeight: '52vh' });
const findTitle = (list: any[] | undefined, id?: string | null) => {
  if (!id || !list?.length) return '';
  const walk = (nodes: any[]): string => {
    for (const node of nodes) {
      if (node.id === id) return node.title;
      if (node.children?.length) {
        const hit = walk(node.children);
        if (hit) return hit;
      }
    }
    return '';
  };
  return walk(list);
};
const categoryText = computed(() => props.article?.categoryTitle || findTitle(props.categories, props.article?.categoryId) || '未分类');
const topicText = computed(() => props.article?.topicTitle || (props.article?.topicId ? props.article.topicId : '未归属'));
const tagTexts = computed<string[]>(() => {
  if (props.article?.tagTitles?.length) return props.article.tagTitles;
  const ids: string[] = props.article?.tagIds ?? [];
  return ids.map((id) => findTitle(props.tags, id)).filter(Boolean);
});
const statItems = computed(() => {
  const source = props.article ?? {};
  const items: { label: string; value: any }[] = [
    { label: '浏览量', value: source.views },
    { label: '点赞数', value: source.likes },
    { label: '评论数', value: source.comments },
    { label: '下载数', value: source.downloads },
    { label: '下单数', value: source.orderCount },
  ];
  return items.filter((item) => item.value !== undefined && item.value !== null);
});
</script>
<style scoped>
.article-info {
  min-width: 0;
}
.info-title {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.info-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}
.info-stat {
  flex: 1 1 96px;
  min-width: 96px;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  text-align: center;
}
.info-stat-value {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.info-stat-label {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.info-desc {
  margin-bottom: 14px;
}
.info-tag {
  margin: 0 6px 4px 0;
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
