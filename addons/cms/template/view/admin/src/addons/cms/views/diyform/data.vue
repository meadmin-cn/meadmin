<template>
  <page>
    <template #searchForm
      ><me-search-form :model="params" @search="search(1)"
        ><el-form-item :label="t('表单')"
          ><el-select v-model="params.formId" clearable style="width: 200px" placeholder="全部表单" @change="onFormChange"><el-option v-for="item in forms" :key="item.id" :value="item.id" :label="item.title" /></el-select></el-form-item
        ><el-form-item :label="t('状态')"
          ><el-select v-model="params.status" clearable style="width: 150px"><el-option v-for="(label, index) in cmsDiyformDataStates" :key="index" :value="index" :label="t(label)" /></el-select></el-form-item
        ><el-form-item :label="t('搜索')"><el-input v-model="params.keyword" clearable placeholder="称呼、联系方式或内容" /></el-form-item
        ><el-form-item
          ><el-button type="primary" :disabled="!params.formId" :loading="exporting" @click="exportCsv">导出当前表单数据</el-button></el-form-item
        ></me-search-form
      ></template
    >
    <div class="data-page">
      <el-alert
        class="data-tip"
        type="info"
        :closable="false"
        show-icon
        :title="params.formId ? `当前表单：${currentForm?.title ?? ''}（导出会按当前筛选条件输出该表单的全部数据）` : '请先在上方选择表单；选中后可按状态筛选、查看详情、审核与回复。'"
      />
      <me-vxe-table border :loading="loading" :data="data?.list ?? []" :pagination-options="{ currentPage: params.page, pageSize: params.pageSize, total: data?.total ?? 0, change: search }" @refresh="search()">
        <vxe-column v-for="column in dynamicColumns" :key="column.name" :field="column.name" :title="column.label" min-width="160" show-overflow :formatter="({ cellValue }) => formatValue(cellValue)" />
        <vxe-column field="status" :title="t('状态')" width="110"
          ><template #default="{ row }"><el-tag :type="statusTagType(row.status)" disable-transitions>{{ t(cmsDiyformDataStates[row.status] ?? '未知') }}</el-tag></template></vxe-column
        >
        <vxe-column field="source" :title="t('来源')" width="120" show-overflow />
        <vxe-column field="createdAt" :title="t('提交时间')" min-width="180" :formatter="formatterAt" />
        <vxe-column :title="t('操作')" fixed="right" min-width="220"
          ><template #default="{ row }">
            <el-button v-if="permission('aon_cms_diyform_data_info')" link @click="openDetail(row.id)">{{ t('详情') }}</el-button>
            <el-button v-if="permission('aon_cms_diyform_data_review')" link type="primary" @click="openReview(row)">{{ t('审核') }}</el-button>
            <el-button v-if="permission('aon_cms_diyform_data_reply')" link type="primary" @click="openReply(row)">{{ t('回复') }}</el-button>
            <el-button v-if="permission('aon_cms_diyform_data_del')" link type="danger" @click="openConfirm(row)">{{ t('删除') }}</el-button>
          </template></vxe-column
        >
      </me-vxe-table>
    </div>

    <!-- 详情：按表单字段逐项展示提交内容 -->
    <me-dialog v-model="detailVisible" title="提交详情" @closed="detailRow = undefined">
      <el-descriptions v-if="detailRow" :column="1" border>
        <el-descriptions-item v-for="field in detailFields" :key="field.name" :label="field.label">{{ formatValue(parseData(detailRow.data)[field.name]) }}</el-descriptions-item>
        <el-descriptions-item label="状态"><el-tag :type="statusTagType(detailRow.status)" disable-transitions>{{ t(cmsDiyformDataStates[detailRow.status] ?? '未知') }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="来源">{{ detailRow.source || '-' }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ formatterAt({ cellValue: detailRow.createdAt }) }}</el-descriptions-item>
      </el-descriptions>
      <template #footer><el-button @click="detailVisible = false">{{ t('关闭') }}</el-button></template>
    </me-dialog>

    <!-- 审核：通过 / 拒绝 -->
    <me-dialog v-model="reviewVisible" title="审核提交数据" @closed="reviewRow = undefined">
      <el-radio-group v-model="reviewStatus">
        <el-radio :value="1">{{ t('通过（前台公开展示）') }}</el-radio>
        <el-radio :value="2">{{ t('拒绝') }}</el-radio>
      </el-radio-group>
      <template #footer><el-button @click="reviewVisible = false">{{ t('取消') }}</el-button><el-button type="primary" :loading="acting" @click="submitReview">{{ t('确定') }}</el-button></template>
    </me-dialog>

    <!-- 回复 -->
    <me-dialog v-model="replyVisible" title="回复提交数据" @closed="replyRow = undefined">
      <el-input v-model="replyText" type="textarea" :rows="4" maxlength="2000" show-word-limit placeholder="回复内容会展示在前台对应条目下" />
      <template #footer><el-button @click="replyVisible = false">{{ t('取消') }}</el-button><el-button type="primary" :loading="acting" @click="submitReply">{{ t('保存回复') }}</el-button></template>
    </me-dialog>

    <ActionConfirm v-model="confirmVisible" title="删除确认" question="确定要删除这条提交数据吗？" desc="删除后不可恢复。" alert-type="error" button-type="danger" confirm-text="确认删除" :items="confirmItems" :loading="acting" @confirm="runConfirm" />
  </page>
</template>
<script setup lang="ts">
import { useLocalesI18n } from '@/locales/i18n';
import { ElMessage } from 'element-plus';
import { formatterAt } from '@/utils/helper.js';
import { permission } from '@/utils/permission';
import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { CmsDiyformField, CmsDiyformData, CmsDiyformInfo } from '../../api/diyform';
import { cmsDiyformDataStates, dataDeleteApi, dataExportApi, dataInfoApi, dataListApi, dataUpdateApi, listApi, parseData, parseFields } from '../../api/diyform';
import type { CmsConfirmItem } from '../../components/actionConfirm';
import ActionConfirm from '../../components/actionConfirm.vue';

const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../lang/${locale}.json`), 'cms']);
const route = useRoute();
const params = reactive({ page: 1, pageSize: 20, formId: (route.query.formId as string) || '', keyword: '', status: null as number | null });
const { data, loading, runAsync } = dataListApi();
const { data: formList, runAsync: loadForms } = listApi();
const { runAsync: updateData } = dataUpdateApi();
const { runAsync: removeData } = dataDeleteApi();
const { runAsync: exportData } = dataExportApi();
const forms = computed<CmsDiyformInfo[]>(() => formList.value?.list ?? []);
const currentForm = computed(() => forms.value.find((item) => item.id === params.formId));
const detailFields = computed<CmsDiyformField[]>(() => (currentForm.value ? parseFields(currentForm.value.fields) : []));
// 列在选中表单后按字段配置动态生成（最多展示 4 个字段，避免表格过宽，其余在详情中查看）
const dynamicColumns = computed<CmsDiyformField[]>(() => detailFields.value.slice(0, 4));
const search = (page = params.page, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize }));
const onFormChange = () => {
  params.page = 1;
  search(1);
};
const formatValue = (value: unknown) => (value === undefined || value === null || value === '' ? '-' : Array.isArray(value) ? value.join('、') : String(value));
const statusTagType = (status: number) => (['warning', 'success', 'danger'][status] ?? 'info') as 'warning' | 'success' | 'danger' | 'info';

// 详情
const detailVisible = ref(false);
const detailRow = ref<CmsDiyformData>();
const openDetail = async (id: string) => {
  detailRow.value = await dataInfoApi().runAsync(id);
  detailVisible.value = true;
};

// 审核
const reviewVisible = ref(false);
const reviewRow = ref<CmsDiyformData>();
const reviewStatus = ref(1);
const openReview = (row: CmsDiyformData) => {
  reviewRow.value = row;
  reviewStatus.value = row.status === 0 ? 1 : row.status;
  reviewVisible.value = true;
};
const submitReview = async () => {
  if (!reviewRow.value) return;
  acting.value = true;
  try {
    await updateData(reviewRow.value.id, { status: reviewStatus.value });
    reviewVisible.value = false;
    await search();
    ElMessage.success('审核结果已保存');
  } finally {
    acting.value = false;
  }
};

// 回复
const replyVisible = ref(false);
const replyRow = ref<CmsDiyformData>();
const replyText = ref('');
const openReply = (row: CmsDiyformData) => {
  replyRow.value = row;
  replyText.value = row.reply ?? '';
  replyVisible.value = true;
};
const submitReply = async () => {
  if (!replyRow.value) return;
  acting.value = true;
  try {
    await updateData(replyRow.value.id, { reply: replyText.value });
    // 留言板数据回复后需要变成「已通过」才能在前台展示
    if (currentForm.value?.isMessageBoard && replyRow.value.status !== 1) await updateData(replyRow.value.id, { status: 1 });
    replyVisible.value = false;
    await search();
    ElMessage.success('回复已保存');
  } finally {
    acting.value = false;
  }
};

// 删除
const confirmVisible = ref(false);
const confirmRow = ref<CmsDiyformData>();
const confirmItems = computed<CmsConfirmItem[]>(() => {
  const row = confirmRow.value;
  if (!row) return [];
  const parsed = parseData(row.data);
  return [
    { label: '称呼', value: row.author || '-' },
    { label: '联系方式', value: row.contact || '-' },
    ...detailFields.value.slice(0, 2).map((field) => ({ label: field.label, value: formatValue(parsed[field.name]) })),
  ];
});
const openConfirm = (row: CmsDiyformData) => {
  confirmRow.value = row;
  confirmVisible.value = true;
};
const runConfirm = async () => {
  if (!confirmRow.value) return;
  acting.value = true;
  try {
    await removeData(confirmRow.value.id);
    confirmVisible.value = false;
    await search();
  } finally {
    acting.value = false;
  }
};

// 导出：后端按当前筛选条件生成 CSV，前端落盘为文件
const exporting = ref(false);
const exportCsv = async () => {
  if (!params.formId) {
    ElMessage.warning('请先选择要导出的表单');
    return;
  }
  exporting.value = true;
  try {
    const res = await exportData({ ...params, formId: params.formId });
    if (!res?.content) {
      ElMessage.warning('当前条件下没有可导出的数据');
      return;
    }
    const blob = new Blob([res.content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentForm.value?.title ?? 'diyform'}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    ElMessage.success(`已导出 ${res.total} 条数据`);
  } finally {
    exporting.value = false;
  }
};

const acting = ref(false);
await Promise.all([loadRes, loadForms({ page: 1, pageSize: 100 }), search()]);
</script>
<style scoped>
.data-page {
  min-width: 0;
}
.data-tip {
  margin-bottom: 4px;
  border-radius: 8px;
}
</style>
