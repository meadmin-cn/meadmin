<template>
  <page>
    <template #searchForm
      ><me-search-form :model="params" @search="search(1)"
        ><el-form-item :label="t('搜索')"><el-input v-model="params.keyword" clearable /></el-form-item
        ><el-form-item :label="t('状态')"
          ><el-select v-model="params.status" clearable style="width: 160px"><el-option v-for="(label, value) in states" :key="value" :value="value" :label="t(label)" /></el-select></el-form-item></me-search-form
    ></template>
    <div class="article-workspace">
      <aside class="article-category-panel">
        <div class="category-panel-header">
          <span>{{ t('栏目') }}</span>
          <el-button v-if="params.categoryId" link type="primary" @click="selectCategory()">{{ t('全部') }}</el-button>
        </div>
        <el-tree
          :data="categories ?? []"
          node-key="id"
          :props="{ label: 'title', children: 'children' }"
          default-expand-all
          highlight-current
          :current-node-key="params.categoryId ?? undefined"
          empty-text="暂无栏目"
          @node-click="selectCategory"
        />
      </aside>
      <section class="article-list-panel">
        <me-vxe-table border :loading="loading" :data="data?.list ?? []" :on-add="permission('aon_cms_article_add') ? () => openEditor() : undefined" :pagination-options="{ currentPage: params.page, pageSize: params.pageSize, total: data?.total ?? 0, change: search }" @refresh="search()">
      <vxe-column field="title" :title="t('标题')" min-width="220" />
      <vxe-column field="slug" :title="t('SEO 标识')" min-width="140" />
      <vxe-column field="status" :title="t('状态')" width="120"
        ><template #default="{ row }"
          ><el-tag>{{ t(states[row.status] ?? '') }}</el-tag></template
        ></vxe-column
      >
      <vxe-column field="publishAt" :title="t('发布时间')" min-width="180" />
      <vxe-column field="createdAt" :title="t('创建时间')" min-width="180" />
      <vxe-column :title="t('操作')" fixed="right" min-width="300"
        ><template #default="{ row }">
          <el-button v-if="row.status === 1 && (permission('aon_cms_article_info') || permission('aon_cms_article_review'))" link type="primary" @click="openReview(row.id)">{{ t('审核') }}</el-button>
          <el-button v-if="permission('aon_cms_article_info')" link @click="openEditor(row.id, true)">{{ t('详情') }}</el-button>
          <el-button v-if="permission('aon_cms_article_edit')" link type="primary" @click="openEditor(row.id)">{{ t('编辑') }}</el-button>
          <el-button v-if="[0, 3, 4].includes(row.status) && permission('aon_cms_article_edit')" link :disabled="acting" @click="action(row.id, 'submit')">{{ t('提交审核') }}</el-button>
          <el-button v-if="row.status === 2 && permission('aon_cms_article_review')" link :disabled="acting" @click="action(row.id, 'offline')">{{ t('下线') }}</el-button>
          <el-popconfirm v-if="permission('aon_cms_article_del')" :title="t('确认删除？')" @confirm="remove(row.id)"
            ><template #reference
              ><el-button link type="danger">{{ t('删除') }}</el-button></template
            ></el-popconfirm
          >
        </template></vxe-column
      >
        </me-vxe-table>
      </section>
    </div>
    <el-dialog v-model="reviewVisible" title="审核详情与历史" width="720px" destroy-on-close>
      <el-skeleton v-if="reviewLoading" :rows="5" animated />
      <template v-else-if="reviewArticle">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="标题">{{ reviewArticle.title }}</el-descriptions-item>
          <el-descriptions-item label="状态"><el-tag>{{ states[reviewArticle.status] }}</el-tag></el-descriptions-item>
          <el-descriptions-item label="摘要" :span="2">{{ reviewArticle.summary || '暂无摘要' }}</el-descriptions-item>
          <el-descriptions-item label="正文" :span="2"><div class="review-content">{{ reviewArticle.mdContent || '暂无正文' }}</div></el-descriptions-item>
        </el-descriptions>
        <el-divider content-position="left">审核操作</el-divider>
        <el-input v-model="reviewReason" type="textarea" :rows="3" maxlength="1000" show-word-limit placeholder="拒绝审核时请填写原因，通过审核可填写备注" />
        <div class="review-actions">
          <el-button v-if="reviewArticle.status === 1 && permission('aon_cms_article_review')" type="success" :loading="reviewActing" @click="reviewAction(true)">审核通过</el-button>
          <el-button v-if="reviewArticle.status === 1 && permission('aon_cms_article_review')" type="warning" :loading="reviewActing" @click="reviewAction(false)">审核拒绝</el-button>
        </div>
        <el-divider content-position="left">审核历史</el-divider>
        <el-alert v-if="reviewHistoryUnavailable" title="审核历史表尚未完成数据库迁移，完成迁移后此处会显示完整时间线。" type="warning" :closable="false" />
        <el-empty v-else-if="!reviewHistory.length" description="暂无审核记录" />
        <el-timeline v-else>
          <el-timeline-item v-for="item in reviewHistory" :key="item.id" :timestamp="item.createdAt" placement="top">
            <strong>{{ reviewActionLabel(item.action) }}</strong>
            <span class="review-transition">{{ states[item.fromStatus] }} → {{ states[item.toStatus] }}</span>
            <p v-if="item.reason">{{ item.reason }}</p>
          </el-timeline-item>
        </el-timeline>
      </template>
    </el-dialog>
  </page>
</template>
<script setup lang="ts">
import { useActionModel } from '@/hooks';
import { useLocalesI18n } from '@/locales/i18n';
import { permission } from '@/utils/permission';
import { ElMessage } from 'element-plus';
import { reactive, ref } from 'vue';
import { actionApi, deleteApi, infoApi, listApi, reviewHistoryApi } from '../../api/article';
import { treeApi } from '../../api/category';
import Editor from './components/editor.vue';
const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../lang/${locale}.json`), 'cms']);
const states = ['草稿', '待审核', '发布', '拒绝', '下线'];
const params = reactive({ page: 1, pageSize: 20, keyword: '', status: undefined as number | undefined, categoryId: undefined as string | undefined });
const { data, loading, runAsync } = listApi();
const { data: categories, runAsync: loadCategories } = treeApi();
const { runAsync: del } = deleteApi();
const search = (page = params.page, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize }));
const selectCategory = (category?: { id: string }) => {
  params.categoryId = category?.id;
  search(1);
};
const { open } = useActionModel(Editor);
const openEditor = (id?: string, readonly = false) => open({ id, readonly, onSuccess: () => search() });
const remove = async (id: string) => {
  await del(id);
  await search(1);
};
const { runAsync: doAction, loading: acting } = actionApi();
const action = async (...args: Parameters<typeof doAction>) => {
  await doAction(...args);
  await search();
};
const reviewVisible = ref(false);
const reviewLoading = ref(false);
const reviewActing = ref(false);
const reviewArticle = ref<any>();
const reviewHistory = ref<any[]>([]);
const reviewHistoryUnavailable = ref(false);
const reviewReason = ref('');
const { runAsync: getInfo } = infoApi();
const { runAsync: getReviewHistory } = reviewHistoryApi();
const openReview = async (id: string) => {
  reviewVisible.value = true;
  reviewLoading.value = true;
  reviewReason.value = '';
  reviewHistoryUnavailable.value = false;
  try {
    reviewArticle.value = await getInfo(id);
    try {
      reviewHistory.value = await getReviewHistory(id);
    } catch {
      reviewHistory.value = [];
      reviewHistoryUnavailable.value = true;
    }
  } finally {
    reviewLoading.value = false;
  }
};
const reviewActionLabel = (actionName: string) => ({ submit: '提交审核', approve: '审核通过', reject: '审核拒绝', offline: '内容下线' }[actionName] ?? actionName);
const reviewAction = async (approve: boolean) => {
  if (!reviewArticle.value) return;
  if (!approve && !reviewReason.value.trim()) {
    ElMessage.warning('拒绝审核时请填写原因');
    return;
  }
  reviewActing.value = true;
  try {
    await doAction(reviewArticle.value.id, 'review', approve, reviewReason.value.trim());
    reviewArticle.value = await getInfo(reviewArticle.value.id);
    try {
      reviewHistory.value = await getReviewHistory(reviewArticle.value.id);
      reviewHistoryUnavailable.value = false;
    } catch {
      reviewHistoryUnavailable.value = true;
    }
    await search();
    ElMessage.success(approve ? '审核已通过' : '审核已拒绝');
  } finally {
    reviewActing.value = false;
  }
};
await Promise.all([loadRes, loadCategories(), search()]);
</script>
<style scoped>
.article-workspace {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 16px;
  min-width: 0;
}
.article-category-panel,
.article-list-panel {
  min-width: 0;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}
.article-category-panel {
  align-self: start;
  max-height: calc(100vh - 190px);
  overflow: auto;
  padding: 14px 8px;
}
.category-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 12px;
  color: var(--el-text-color-primary);
  font-weight: 600;
}
.article-category-panel :deep(.el-tree-node__content) {
  height: 34px;
  border-radius: 4px;
}
.article-category-panel :deep(.el-tree-node__content:hover),
.article-category-panel :deep(.is-current > .el-tree-node__content) {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}
.article-list-panel {
  overflow: hidden;
}
.review-content {
  max-height: 180px;
  overflow: auto;
  white-space: pre-wrap;
  line-height: 1.7;
}
.review-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
.review-transition {
  margin-left: 12px;
  color: var(--el-text-color-secondary);
}
@media (max-width: 900px) {
  .article-workspace {
    grid-template-columns: 1fr;
  }
  .article-category-panel {
    max-height: 240px;
  }
}
</style>
