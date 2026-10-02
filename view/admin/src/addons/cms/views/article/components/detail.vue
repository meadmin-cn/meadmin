<template>
  <me-dialog v-model="show" title="文章详情" width="min(1000px, calc(100% - 32px))" :close-on-click-modal="false" class="article-detail-dialog" @closed="emit('closed')">
    <el-skeleton v-if="loading" :rows="10" animated />
    <div v-else-if="article">
      <h2 class="detail-title">{{ article.title }}</h2>
      <ArticleInfo :article="article" :categories="categories ?? []" :tags="tags" />
    </div>
    <el-empty v-else description="未获取到文章信息" />
  </me-dialog>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { infoApi } from '../../../api/article';
import { treeApi } from '../../../api/category';
import { listApi as tagListApi } from '../../../api/tag';
import ArticleInfo from './articleInfo.vue';
const props = defineProps<{ id?: string }>();
const emit = defineEmits<{ closed: [] }>();
const show = defineModel<boolean>();
const { runAsync: getInfo, loading } = infoApi();
const { data: categories, runAsync: loadCategories } = treeApi();
const { data: tagData, runAsync: loadTags } = tagListApi();
// 详情接口已返回 categoryTitle / tagTitles，栏目树与标签列表仅作为快照反查的兜底数据
const tags = computed(() => tagData.value?.list ?? []);
const article = ref<any>();
watch(show, (v) => {
  if (v && props.id) load();
});
const load = async () => {
  if (!props.id) return;
  article.value = await getInfo(props.id);
};
await Promise.all([loadCategories(), loadTags({ page: 1, pageSize: 100 })]);
</script>
<style scoped>
.detail-title {
  margin: 0 0 14px;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
</style>
