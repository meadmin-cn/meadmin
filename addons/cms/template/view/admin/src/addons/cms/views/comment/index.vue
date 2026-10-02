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
      <vxe-column field="reportedAt" title="最近举报时间" width="180" :formatter="formatterAt" />
      <vxe-column field="reportCount" :title="t('举报')" width="90"
        ><template #default="{ row }"
          ><el-tag v-if="row.reportCount" type="danger">{{ row.reportCount }}</el-tag
          ><span v-else>0</span></template
        ></vxe-column
      >
      <vxe-column field="reportReason" :title="t('举报说明')" min-width="160" show-overflow />

      <vxe-column field="createdAt" :title="t('创建时间')" min-width="180" :formatter="formatterAt" />
      <vxe-column :title="t('操作')" fixed="right" min-width="300"
        ><template #default="{ row }">
          <el-button v-if="permission('aon_cms_comment_info')" link @click="openEditor(row.id, true)">{{ t('详情') }}</el-button>
          <el-button v-if="permission('aon_cms_comment_info')" link type="danger" :disabled="!row.reportCount" @click="openReports(row.id)">举报明细</el-button>
          <el-button v-if="permission('aon_cms_comment_edit')" link type="primary" @click="openEditor(row.id)">{{ t('编辑') }}</el-button>

          <template v-if="permission('aon_cms_comment_review')"
            ><el-button link type="success" :disabled="row.status === 1 || acting" @click="openConfirm(row, 'show')">{{ t('展示') }}</el-button
            ><el-button link type="warning" :disabled="row.status === 2 || acting" @click="openConfirm(row, 'hide')">{{ t('隐藏') }}</el-button></template
          >
          <el-button v-if="permission('aon_cms_comment_del')" link type="danger" @click="openConfirm(row, 'del')">{{ t('删除') }}</el-button>
        </template></vxe-column
      >
    </me-vxe-table>
    <!-- 操作二次确认：展示 / 隐藏 / 删除 统一确认后再执行 -->
    <ActionConfirm v-model="confirmVisible" :title="confirmMeta.title" :question="confirmMeta.question" :desc="confirmMeta.desc" :alert-type="confirmMeta.alertType" :button-type="confirmMeta.buttonType" :confirm-text="confirmMeta.confirmText" :items="confirmItems" :loading="confirmActing" @confirm="runConfirm">
      <el-input v-if="confirmType === 'hide'" v-model="confirmReason" type="textarea" :rows="3" maxlength="1000" show-word-limit placeholder="请填写隐藏原因（必填，会写入审核日志）" class="confirm-reason" />
    </ActionConfirm>
    <el-dialog v-model="reportsVisible" title="举报明细" width="min(960px, calc(100% - 32px))" class="report-dialog">
      <el-descriptions v-if="reportComment" :column="1" border size="small" class="report-summary">
        <el-descriptions-item v-if="reportComment.articleTitle" label="所属文章">{{ reportComment.articleTitle }}</el-descriptions-item>
        <el-descriptions-item label="被举报评论"><span class="report-author">{{ reportComment.author }}</span>{{ reportComment.content }}</el-descriptions-item>
        <el-descriptions-item label="举报情况">共 {{ reportComment.reportCount ?? 0 }} 次举报<template v-if="reportComment.reportedAt"> · 最近 {{ formatterAtExec(reportComment.reportedAt) }}</template></el-descriptions-item>
      </el-descriptions>
      <el-alert v-if="reportMissing" title="该评论有举报计数但查不到举报记录（历史数据），请人工核对后处理。" type="warning" :closable="false" class="report-comment" />
      <el-table v-loading="reportsLoading" :data="reportsData?.list ?? []" border empty-text="暂无举报记录">
        <el-table-column label="举报时间" width="170"><template #default="{ row }">{{ formatterAtExec(row.createdAt) }}</template></el-table-column>
        <el-table-column label="举报人" width="150"><template #default="{ row }">{{ row.userName || (row.userId ? `用户 ${row.userId}` : '匿名访客') }}</template></el-table-column>
        <el-table-column prop="reason" label="举报原因" min-width="220" show-overflow-tooltip />
        <el-table-column label="所属文章" min-width="220" show-overflow-tooltip><template #default="{ row }">{{ row.articleTitle || '—' }}<span v-if="row.articleSlug" class="report-slug">/{{ row.articleSlug }}</span></template></el-table-column>
      </el-table>
      <el-pagination v-if="reportsData?.total" v-model:current-page="reportsPage" :page-size="reportsPageSize" :total="reportsData.total" layout="total, prev, pager, next" class="reports-pagination" @current-change="loadReports" />
    </el-dialog>
  </page>
</template>
<script setup lang="ts">
import { useActionModel } from '@/hooks';
import { useLocalesI18n } from '@/locales/i18n';
import { formatterAt, formatterAtExec } from '@/utils/helper.js';
import { permission } from '@/utils/permission';
import { ElMessage } from 'element-plus';
import { computed, reactive, ref } from 'vue';
import { actionApi, deleteApi, infoApi, listApi, reportsApi } from '../../api/comment';
import type { CmsConfirmAlertType, CmsConfirmButtonType, CmsConfirmItem } from '../../components/actionConfirm';
import ActionConfirm from '../../components/actionConfirm.vue';
import Editor from './components/editor.vue';
const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../lang/${locale}.json`), 'cms']);
const states = ['待审核', '展示', '关闭'];
const params = reactive({ page: 1, pageSize: 20, keyword: '', status: undefined as number | undefined });
const reportView = ref(false);
const reportsVisible = ref(false);
const reportsPage = ref(1);
const reportsPageSize = 10;
const reportComment = ref<{ author: string; content: string; reportCount?: number; reportedAt?: string | null; articleTitle?: string }>();
const reportsCommentId = ref('');
const { data, loading, runAsync } = listApi();
const { data: reportsData, loading: reportsLoading, runAsync: getReports } = reportsApi();
const { runAsync: getCommentInfo } = infoApi();
const { runAsync: del } = deleteApi();
const search = (page = params.page, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize, ...(reportView.value ? { status: 0 } : {}) }));
const { open } = useActionModel(Editor);
const openEditor = (id?: string, readonly = false) => open({ id, readonly, onSuccess: () => search() });
// 计数与明细必须对得上：有举报次数却查不到记录时给出人工核对提示。
const reportMissing = computed(() => Boolean(reportComment.value?.reportCount) && !(reportsData.value?.list ?? []).length);
const loadReports = (page = reportsPage.value) => {
  reportsPage.value = page;
  return getReports({ page, pageSize: reportsPageSize, commentId: reportsCommentId.value });
};
const openReports = async (id: string) => {
  const comment = await getCommentInfo(id);
  reportComment.value = { author: comment.author, content: comment.content, reportCount: comment.reportCount, reportedAt: comment.reportedAt, articleTitle: comment.articleTitle };
  reportsCommentId.value = id;
  reportsPage.value = 1;
  reportsVisible.value = true;
  await loadReports();
};
// 操作二次确认：展示 / 隐藏 / 删除
type ConfirmType = 'show' | 'hide' | 'del';
const confirmVisible = ref(false);
const confirmType = ref<ConfirmType>('del');
const confirmRow = ref<any>();
const confirmReason = ref('');
const confirmActing = ref(false);
const confirmConfigs: Record<ConfirmType, { title: string; question: string; desc: string; alertType: CmsConfirmAlertType; buttonType: CmsConfirmButtonType; confirmText: string; nextStatus?: number }> = {
  show: {
    title: '展示确认',
    question: '确定要将这条评论设为展示吗？',
    desc: '展示后评论在前台立即可见，并计入所属文章的评论数。',
    alertType: 'info',
    buttonType: 'success',
    confirmText: '确认展示',
    nextStatus: 1,
  },
  hide: {
    title: '隐藏确认',
    question: '确定要隐藏这条评论吗？',
    desc: '隐藏后评论在前台不再展示，且不再计入文章评论数；需填写隐藏原因，原因会写入审核日志。',
    alertType: 'warning',
    buttonType: 'warning',
    confirmText: '确认隐藏',
    nextStatus: 2,
  },
  del: {
    title: '删除确认',
    question: '确定要删除这条评论吗？',
    desc: '删除后不可恢复，其下的回复也会一并失效，所属文章的评论数会同步更新。',
    alertType: 'error',
    buttonType: 'danger',
    confirmText: '确认删除',
  },
};
const statusTagType = (status: number) => (['warning', 'success', 'danger'] as const)[status] ?? 'info';
const confirmMeta = computed(() => confirmConfigs[confirmType.value]);
const confirmItems = computed<CmsConfirmItem[]>(() => {
  const row = confirmRow.value;
  if (!row) return [];
  const content = String(row.content ?? '');
  const items: CmsConfirmItem[] = [
    { label: '评论内容', value: content.length > 60 ? content.slice(0, 60) + '…' : content },
    { label: '显示名称', value: row.author },
    { label: '当前状态', value: t(states[row.status] ?? ''), tag: true, tagType: statusTagType(row.status) },
    { label: '举报次数', value: row.reportCount ?? 0 },
  ];
  const next = confirmMeta.value.nextStatus;
  if (next !== undefined) items.push({ label: '操作后状态', value: t(states[next] ?? ''), tag: true, tagType: statusTagType(next) });
  return items;
});
const openConfirm = (row: any, type: ConfirmType) => {
  confirmRow.value = row;
  confirmType.value = type;
  confirmReason.value = '';
  confirmVisible.value = true;
};
const { runAsync: doAction, loading: acting } = actionApi();
const runConfirm = async () => {
  const row = confirmRow.value;
  const type = confirmType.value;
  if (!row) return;
  if (type === 'hide' && !confirmReason.value.trim()) {
    ElMessage.warning('隐藏评论时请填写原因');
    return;
  }
  confirmActing.value = true;
  try {
    if (type === 'del') {
      await del(row.id);
      await search(1);
    } else {
      await doAction(row.id, 'review', type === 'show', confirmReason.value.trim());
      await search();
    }
    confirmVisible.value = false;
  } catch {
    // 失败提示由请求层统一处理，保留弹窗便于调整后重试
  } finally {
    confirmActing.value = false;
  }
};
await Promise.all([loadRes, search()]);
</script>
<style scoped>
.confirm-reason {
  margin-bottom: 14px;
}
.report-summary {
  margin-bottom: 16px;
}
.report-summary :deep(.el-descriptions__label) {
  width: 104px;
  color: var(--el-text-color-secondary);
}
.report-author {
  margin-right: 8px;
  color: var(--el-text-color-primary);
  font-weight: 600;
}
.report-slug {
  margin-left: 6px;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}
.report-comment {
  margin-bottom: 16px;
}
.reports-pagination {
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
