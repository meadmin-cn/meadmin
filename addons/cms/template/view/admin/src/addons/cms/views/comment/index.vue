<template>
  <page>
    <template #searchForm
      ><me-search-form :model="params" @search="search(1)"
        ><el-form-item :label="t('搜索')"><el-input v-model="params.keyword" clearable /></el-form-item
        ><el-form-item :label="t('状态')"
          ><el-select v-model="params.status" clearable style="width: 160px"><el-option v-for="(label, value) in states" :key="value" :value="value" :label="t(label)" /></el-select></el-form-item><el-form-item label="审查视图"><el-switch v-model="reportView" active-text="举报优先" @change="search(1)" /></el-form-item></me-search-form
    ></template>
    <me-vxe-table border :loading="loading" :data="data?.list ?? []" :on-add="permission('aon_cms_comment_add') ? () => openEditor() : undefined" :pagination-options="{ currentPage: params.page, pageSize: params.pageSize, total: data?.total ?? 0, change: search }" @refresh="search()">
      <vxe-column field="content" :title="t('评论内容')" min-width="220" />
      <vxe-column field="author" :title="t('显示名称')" />
      <vxe-column field="status" :title="t('状态')" width="120"
        ><template #default="{ row }"
          ><el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'danger' : 'warning'">{{ t(states[row.status] ?? '') }}</el-tag></template
        ></vxe-column
      >
      <vxe-column field="reportedAt" title="最近举报时间" width="170" />
      <vxe-column field="reportCount" :title="t('举报')" width="90"
        ><template #default="{ row }"
          ><el-tag v-if="row.reportCount" type="danger">{{ row.reportCount }}</el-tag
          ><span v-else>0</span></template
        ></vxe-column
      >
      <vxe-column field="reportReason" :title="t('举报说明')" min-width="160" show-overflow />

      <vxe-column field="createdAt" :title="t('创建时间')" min-width="180" />
      <vxe-column :title="t('操作')" fixed="right" min-width="300"
        ><template #default="{ row }">
          <el-button v-if="permission('aon_cms_comment_info')" link @click="openEditor(row.id, true)">{{ t('详情') }}</el-button>
          <el-button v-if="permission('aon_cms_comment_info') && row.reportCount" link type="danger" @click="openReports(row.id)">举报明细</el-button>
          <el-button v-if="permission('aon_cms_comment_edit')" link type="primary" @click="openEditor(row.id)">{{ t('编辑') }}</el-button>

          <template v-if="permission('aon_cms_comment_review')"
            ><el-button link type="success" :disabled="acting" @click="action(row.id, 'review', true)">{{ t('审核展示') }}</el-button
            ><el-button link type="warning" :disabled="acting" @click="action(row.id, 'review', false)">{{ t('审核关闭') }}</el-button></template
          >
          <el-popconfirm v-if="permission('aon_cms_comment_del')" :title="t('确认删除？')" @confirm="remove(row.id)"
            ><template #reference
              ><el-button link type="danger">{{ t('删除') }}</el-button></template
            ></el-popconfirm
          >
        </template></vxe-column
      >
    </me-vxe-table>
    <el-dialog v-model="reportsVisible" title="举报明细" width="min(920px, calc(100% - 32px))">
      <el-alert v-if="reportComment" :title="`${reportComment.author}：${reportComment.content}`" type="info" :closable="false" class="report-comment" />
      <el-table v-loading="reportsLoading" :data="reportsData?.list ?? []" border>
        <el-table-column prop="createdAt" label="举报时间" width="180" />
        <el-table-column prop="userId" label="举报人" width="180" />
        <el-table-column prop="reason" label="举报原因" min-width="260" show-overflow-tooltip />
        <el-table-column prop="articleId" label="文章 ID" width="180" />
      </el-table>
      <el-pagination v-if="reportsData?.total" v-model:current-page="reportsPage" :page-size="reportsPageSize" :total="reportsData.total" layout="total, prev, pager, next" class="reports-pagination" @current-change="loadReports" />
    </el-dialog>
  </page>
</template>
<script setup lang="ts">
import { useActionModel } from '@/hooks';
import { useLocalesI18n } from '@/locales/i18n';
import { permission } from '@/utils/permission';
import { reactive, ref } from 'vue';
import { actionApi, deleteApi, infoApi, listApi, reportsApi } from '../../api/comment';
import Editor from './components/editor.vue';
const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../lang/${locale}.json`), 'cms']);
const states = ['待审核', '展示', '关闭'];
const params = reactive({ page: 1, pageSize: 20, keyword: '', status: undefined as number | undefined });
const reportView = ref(false);
const reportsVisible = ref(false);
const reportsPage = ref(1);
const reportsPageSize = 10;
const reportComment = ref<{ author: string; content: string }>();
const reportsCommentId = ref('');
const { data, loading, runAsync } = listApi();
const { data: reportsData, loading: reportsLoading, runAsync: getReports } = reportsApi();
const { runAsync: getCommentInfo } = infoApi();
const { runAsync: del } = deleteApi();
const search = (page = params.page, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize, ...(reportView.value ? { status: 0 } : {}) }));
const { open } = useActionModel(Editor);
const openEditor = (id?: string, readonly = false) => open({ id, readonly, onSuccess: () => search() });
const loadReports = (page = reportsPage.value) => {
  reportsPage.value = page;
  return getReports({ page, pageSize: reportsPageSize, commentId: reportsCommentId.value });
};
const openReports = async (id: string) => {
  const comment = await getCommentInfo(id);
  reportComment.value = { author: comment.author, content: comment.content };
  reportsCommentId.value = id;
  reportsPage.value = 1;
  reportsVisible.value = true;
  await loadReports();
};
const remove = async (id: string) => {
  await del(id);
  await search(1);
};
const { runAsync: doAction, loading: acting } = actionApi();
const action = async (...args: Parameters<typeof doAction>) => {
  await doAction(...args);
  await search();
};
await Promise.all([loadRes, search()]);
</script>
<style scoped>
.report-comment {
  margin-bottom: 16px;
}
.reports-pagination {
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
