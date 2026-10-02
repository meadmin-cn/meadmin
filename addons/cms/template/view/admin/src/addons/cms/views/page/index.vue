<template>
  <page>
    <template #searchForm
      ><me-search-form :model="params" @search="search(1)"
        ><el-form-item :label="t('搜索')"><el-input v-model="params.keyword" clearable /></el-form-item
        ><el-form-item :label="t('状态')"
          ><el-select v-model="params.status" clearable style="width: 160px"><el-option v-for="(label, value) in states" :key="value" :value="value" :label="t(label)" /></el-select></el-form-item></me-search-form
    ></template>
    <me-vxe-table border :loading="loading" :data="data?.list ?? []" :on-add="permission('aon_cms_page_add') ? () => openEditor() : undefined" :pagination-options="{ currentPage: params.page, pageSize: params.pageSize, total: data?.total ?? 0, change: search }" @refresh="search()">
      <vxe-column field="title" :title="t('标题')" min-width="220" />
      <vxe-column field="slug" :title="t('SEO 标识')" min-width="140" />
      <vxe-column field="status" :title="t('状态')" width="120"
        ><template #default="{ row }"
          ><el-tag>{{ t(states[row.status] ?? '') }}</el-tag></template
        ></vxe-column
      >
      <vxe-column field="publishAt" :title="t('发布时间')" min-width="180" :formatter="formatterAt" />
      <vxe-column field="createdAt" :title="t('创建时间')" min-width="180" :formatter="formatterAt" />
      <vxe-column :title="t('操作')" fixed="right" min-width="320"
        ><template #default="{ row }">
          <el-button v-if="permission('aon_cms_page_info') || permission('aon_cms_page_review')" link type="primary" :disabled="row.status !== 1 || acting" @click="openReview(row.id)">{{ t('审核') }}</el-button>
          <el-button v-if="permission('aon_cms_page_info')" link @click="openDetail(row.id)">{{ t('详情') }}</el-button>
          <el-button v-if="permission('aon_cms_page_edit')" link type="primary" @click="openEditor(row.id)">{{ t('编辑') }}</el-button>
          <el-button v-if="permission('aon_cms_page_edit')" link :disabled="![0, 3, 4].includes(row.status) || acting" @click="openConfirm(row, 'submit')">{{ t('提交审核') }}</el-button>
          <el-button v-if="permission('aon_cms_page_review')" link :disabled="row.status !== 2 || acting" @click="openConfirm(row, 'offline')">{{ t('下线') }}</el-button>
          <el-button v-if="permission('aon_cms_page_del')" link type="danger" @click="openConfirm(row, 'del')">{{ t('删除') }}</el-button>
        </template></vxe-column
      >
    </me-vxe-table>
    <!-- 操作二次确认：提交审核 / 下线 / 删除 统一确认后再执行，审核通过/拒绝在审核弹窗内完成 -->
    <ActionConfirm v-model="confirmVisible" :title="confirmMeta.title" :question="confirmMeta.question" :desc="confirmMeta.desc" :alert-type="confirmMeta.alertType" :button-type="confirmMeta.buttonType" :confirm-text="confirmMeta.confirmText" :items="confirmItems" :loading="confirmActing" @confirm="runConfirm" />
    <el-dialog v-model="reviewVisible" title="审核详情与历史" width="min(1180px, calc(100% - 32px))" top="4vh" destroy-on-close class="review-dialog">
      <el-skeleton v-if="reviewLoading" :rows="10" animated />
      <div v-else-if="reviewPage" class="review-layout">
        <section class="review-detail">
          <h2 class="review-detail-title">{{ reviewPage.title }}</h2>
          <PageInfo :page="reviewPage" />
        </section>
        <aside class="review-history">
          <div class="review-history-header">审核历史</div>
          <el-alert v-if="reviewHistoryUnavailable" title="审核历史表尚未完成数据库迁移，完成迁移后此处会显示完整时间线。" type="warning" :closable="false" />
          <el-empty v-else-if="!reviewHistory.length" description="暂无审核记录" />
          <el-timeline v-else>
            <el-timeline-item v-for="item in reviewHistory" :key="item.id" :timestamp="formatterAtExec(item.createdAt)" placement="top">
              <div class="review-history-item">
                <div class="review-history-head">
                  <strong>{{ reviewActionLabel(item.action) }}</strong>
                  <span class="review-transition">{{ states[item.fromStatus] }} → {{ states[item.toStatus] }}</span>
                </div>
                <div v-if="item.createdAdminName" class="review-history-admin">操作人：{{ item.createdAdminName }}</div>
                <p v-if="item.reason" class="review-history-reason">{{ item.reason }}</p>
                <el-button v-if="item.snapshot" link type="primary" class="review-history-snap-btn" @click="openSnapshot(item)">查看当时详情</el-button>
                <p v-else class="review-history-nosnap">（无内容快照）</p>
              </div>
            </el-timeline-item>
          </el-timeline>
          <template v-if="reviewPage.status === 1 && permission('aon_cms_page_review')">
            <el-divider content-position="left">审核操作</el-divider>
            <el-input v-model="reviewReason" type="textarea" :rows="3" maxlength="1000" show-word-limit placeholder="拒绝审核时请填写原因，通过审核可填写备注" />
            <div class="review-actions">
              <el-button type="success" :loading="reviewActing" @click="reviewAction(true)">审核通过</el-button>
              <el-button type="warning" :loading="reviewActing" @click="reviewAction(false)">审核拒绝</el-button>
            </div>
          </template>
        </aside>
      </div>
    </el-dialog>
    <!-- 审核历史快照详情 -->
    <el-dialog v-model="snapshotVisible" :title="snapshotTitle" width="min(900px, calc(100% - 32px))" top="6vh" append-to-body destroy-on-close class="snapshot-dialog">
      <PageInfo v-if="snapshotData" :page="snapshotData" show-title />
      <el-empty v-else description="该记录没有内容快照" />
    </el-dialog>
    <Detail :id="detailId" v-model="detailVisible" @closed="search()" />
  </page>
</template>
<script setup lang="ts">
import { useActionModel } from '@/hooks';
import { useLocalesI18n } from '@/locales/i18n';
import { formatterAt, formatterAtExec } from '@/utils/helper.js';
import { permission } from '@/utils/permission';
import { ElMessage } from 'element-plus';
import { computed, reactive, ref } from 'vue';
import { actionApi, deleteApi, infoApi, listApi, parseSnapshot, reviewHistoryApi } from '../../api/page';
import type { CmsConfirmAlertType, CmsConfirmButtonType, CmsConfirmItem } from '../../components/actionConfirm';
import ActionConfirm from '../../components/actionConfirm.vue';
import Editor from './components/editor.vue';
import Detail from './components/detail.vue';
import PageInfo from './components/pageInfo.vue';
const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../lang/${locale}.json`), 'cms']);
const states = ['草稿', '待审核', '发布', '拒绝', '下线'];
const params = reactive({ page: 1, pageSize: 20, keyword: '', status: undefined as number | undefined });
const { data, loading, runAsync } = listApi();
const { runAsync: del } = deleteApi();
const search = (page = params.page, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize }));
const { open } = useActionModel(Editor);
const openEditor = (id?: string, readonly = false) => open({ id, readonly, onSuccess: () => search() });
const detailVisible = ref(false);
const detailId = ref<string>();
const openDetail = (id: string) => {
  detailId.value = id;
  detailVisible.value = true;
};
// 操作二次确认：提交审核 / 下线 / 删除
type ConfirmType = 'submit' | 'offline' | 'del';
const confirmVisible = ref(false);
const confirmType = ref<ConfirmType>('del');
const confirmRow = ref<any>();
const confirmActing = ref(false);
const confirmConfigs: Record<ConfirmType, { title: string; question: string; desc: string; alertType: CmsConfirmAlertType; buttonType: CmsConfirmButtonType; confirmText: string; nextStatus?: number }> = {
  submit: {
    title: '提交审核确认',
    question: '确定要将这个单页提交审核吗？',
    desc: '提交后状态变为「待审核」，前台仍不可访问；需管理员审核通过后才会正式发布。',
    alertType: 'info',
    buttonType: 'primary',
    confirmText: '确认提交审核',
    nextStatus: 1,
  },
  offline: {
    title: '下线确认',
    question: '确定要将这个已发布单页下线吗？',
    desc: '下线后状态变为「下线」，前台将立即不可访问；可重新编辑后再次提交审核。',
    alertType: 'warning',
    buttonType: 'warning',
    confirmText: '确认下线',
    nextStatus: 4,
  },
  del: {
    title: '删除确认',
    question: '确定要删除这个单页吗？',
    desc: '删除后不可恢复，前台访问将返回 404。',
    alertType: 'error',
    buttonType: 'danger',
    confirmText: '确认删除',
  },
};
const statusTagType = (status: number) => (['info', 'warning', 'success', 'danger', 'info'] as const)[status] ?? 'info';
const confirmMeta = computed(() => confirmConfigs[confirmType.value]);
const confirmItems = computed<CmsConfirmItem[]>(() => {
  const row = confirmRow.value;
  if (!row) return [];
  const items: CmsConfirmItem[] = [
    { label: '单页标题', value: row.title },
    { label: 'SEO 标识', value: row.slug },
    { label: '当前状态', value: t(states[row.status] ?? ''), tag: true, tagType: statusTagType(row.status) },
  ];
  const next = confirmMeta.value.nextStatus;
  if (next !== undefined) items.push({ label: '操作后状态', value: t(states[next] ?? ''), tag: true, tagType: statusTagType(next) });
  return items;
});
const openConfirm = (row: any, type: ConfirmType) => {
  confirmRow.value = row;
  confirmType.value = type;
  confirmVisible.value = true;
};
const { runAsync: doAction, loading: acting } = actionApi();
const runConfirm = async () => {
  const row = confirmRow.value;
  const type = confirmType.value;
  if (!row) return;
  confirmActing.value = true;
  try {
    if (type === 'del') {
      await del(row.id);
      await search(1);
    } else {
      await doAction(row.id, type);
      await search();
    }
    confirmVisible.value = false;
  } catch {
    // 失败提示由请求层统一处理，保留弹窗便于调整后重试
  } finally {
    confirmActing.value = false;
  }
};
// 审核弹窗：左侧单页全量详情，右侧审核历史 + 审核操作（与文章页保持一致）
const reviewVisible = ref(false);
const reviewLoading = ref(false);
const reviewActing = ref(false);
const reviewPage = ref<any>();
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
    reviewPage.value = await getInfo(id);
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
const snapshotVisible = ref(false);
const snapshotData = ref<any>();
const snapshotTitle = ref('审核快照详情');
const openSnapshot = (item: any) => {
  const data = parseSnapshot(item.snapshot);
  if (!data) return;
  snapshotData.value = data;
  snapshotTitle.value = `审核快照详情 · ${reviewActionLabel(item.action)} · ${formatterAtExec(item.createdAt)}`;
  snapshotVisible.value = true;
};
const reviewActionLabel = (actionName: string) => ({ submit: '提交审核', approve: '审核通过', reject: '审核拒绝', offline: '内容下线' }[actionName] ?? actionName);
const reviewAction = async (approve: boolean) => {
  if (!reviewPage.value) return;
  if (!approve && !reviewReason.value.trim()) {
    ElMessage.warning('拒绝审核时请填写原因');
    return;
  }
  reviewActing.value = true;
  try {
    await doAction(reviewPage.value.id, 'review', approve, reviewReason.value.trim());
    reviewPage.value = await getInfo(reviewPage.value.id);
    try {
      reviewHistory.value = await getReviewHistory(reviewPage.value.id);
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
await Promise.all([loadRes, search()]);
</script>
<style scoped>
.review-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
  grid-template-rows: minmax(0, 1fr);
  gap: 20px;
  max-height: 80vh;
  min-width: 0;
}
.review-detail,
.review-history {
  min-width: 0;
  overflow: auto;
  padding-right: 6px;
}
.review-detail-title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.review-history {
  border-left: 1px solid var(--el-border-color-lighter);
  padding-left: 20px;
}
.review-history-header {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}
.review-history-item {
  min-width: 0;
}
.review-history-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.review-history-admin {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.review-history-reason {
  margin: 6px 0 0;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  padding: 6px 10px;
  border-radius: 6px;
}
.review-history-snap-btn {
  margin-top: 6px;
  padding: 0;
  height: auto;
}
.review-history-nosnap {
  margin: 6px 0 0;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
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
  .review-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    max-height: none;
  }
  .review-history {
    border-left: 0;
    padding-left: 0;
    border-top: 1px solid var(--el-border-color-lighter);
    padding-top: 16px;
  }
}
</style>
