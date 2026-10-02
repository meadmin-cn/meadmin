<template>
  <page>
    <template #searchForm>
      <me-search-form :model="params" @search="search(1)">
        <el-form-item label="搜索"><el-input v-model="params.keyword" clearable placeholder="订单号/收件人/电话/商品/快递单号" style="width: 260px" /></el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="params.status" clearable style="width: 130px"><el-option v-for="item in ORDER_STATUS" :key="item.value" :value="item.value" :label="item.label" /></el-select>
        </el-form-item>
        <el-form-item label="收款状态">
          <el-select v-model="params.paymentStatus" clearable style="width: 130px"><el-option v-for="item in PAYMENT_STATUS" :key="item.value" :value="item.value" :label="item.label" /></el-select>
        </el-form-item>
        <el-form-item label="发货状态">
          <el-select v-model="params.shippingStatus" clearable style="width: 130px"><el-option v-for="item in SHIPPING_STATUS" :key="item.value" :value="item.value" :label="item.label" /></el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker v-model="params.createdAt" type="datetimerange" value-format="YYYY-MM-DDTHH:mm:ssZ" :default-time="[new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]" start-placeholder="开始" end-placeholder="结束" />
        </el-form-item>
      </me-search-form>
    </template>
    <div class="order-summary">
      <div v-for="card in summaryCards" :key="card.key" class="order-summary__card" :class="{ 'is-active': activeCard === card.key }" @click="applyCard(card.key)">
        <div class="order-summary__label">{{ card.label }}</div>
        <div class="order-summary__value" :style="{ color: card.color }">{{ card.value }}</div>
      </div>
    </div>
    <me-vxe-table border :loading="loading" :data="data?.list ?? []" :pagination-options="{ currentPage: params.page, pageSize: params.pageSize, total: data?.total ?? 0, change: search }" @refresh="refresh()">
      <vxe-column field="orderNo" title="订单号" width="170" fixed="left">
        <template #default="{ row }"><el-button link type="primary" @click="openDetail(row.id)">{{ row.orderNo }}</el-button></template>
      </vxe-column>
      <vxe-column field="itemName" title="商品" min-width="180" show-overflow>
        <template #default="{ row }">{{ row.itemName }} <span class="order-muted">× {{ row.quantity }}</span></template>
      </vxe-column>
      <vxe-column field="amount" title="金额" width="110" align="right">
        <template #default="{ row }">
          <div>¥{{ row.amount }}</div>
          <div v-if="row.paymentStatus === 1 && row.paidAmount !== row.amount" class="order-muted">实收 ¥{{ row.paidAmount }}</div>
        </template>
      </vxe-column>
      <vxe-column title="收件人" min-width="200">
        <template #default="{ row }">
          <div>{{ row.contactName }} {{ row.contactPhone }}</div>
          <div class="order-muted order-ellipsis" :title="row.shippingAddress">{{ row.shippingAddress }}</div>
        </template>
      </vxe-column>
      <vxe-column title="状态" width="210">
        <template #default="{ row }">
          <div class="order-tags">
            <el-tag size="small" effect="dark" :type="statusOf(ORDER_STATUS, row.status).type">{{ statusOf(ORDER_STATUS, row.status).label }}</el-tag>
            <el-tag size="small" :type="statusOf(PAYMENT_STATUS, row.paymentStatus).type">{{ statusOf(PAYMENT_STATUS, row.paymentStatus).label }}</el-tag>
            <el-tag size="small" :type="statusOf(SHIPPING_STATUS, row.shippingStatus).type">{{ statusOf(SHIPPING_STATUS, row.shippingStatus).label }}</el-tag>
          </div>
        </template>
      </vxe-column>
      <vxe-column title="快递" min-width="170">
        <template #default="{ row }">
          <template v-if="row.expressNo">
            <div>{{ row.expressCompany }}</div>
            <div class="order-muted">{{ row.expressNo }}</div>
          </template>
          <span v-else class="order-muted">—</span>
        </template>
      </vxe-column>
      <vxe-column field="nextFollowAt" title="下次跟进" width="140">
        <template #default="{ row }">
          <span v-if="row.nextFollowAt" :class="{ 'order-overdue': isOverdue(row) }">{{ formatTime(row.nextFollowAt) }}</span>
          <span v-else class="order-muted">—</span>
        </template>
      </vxe-column>
      <vxe-column field="createdAt" title="下单时间" width="140">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </vxe-column>
      <vxe-column title="操作" fixed="right" width="250">
        <template #default="{ row }">
          <el-button v-if="permission('aon_cms_order_info')" link @click="openDetail(row.id)">详情</el-button>
          <order-buttons :order="row" link :limit="3" @action="onAction" />
          <el-button v-if="permission('aon_cms_order_del')" link type="danger" :disabled="row.status !== 3" @click="openConfirm(row)">删除</el-button>
        </template>
      </vxe-column>
    </me-vxe-table>
    <!-- 删除二次确认：订单涉及收款与发货记录，删除前先核对订单号与金额 -->
    <ActionConfirm v-model="confirmVisible" title="删除确认" question="确定要删除该已关闭订单吗？" desc="删除后不可恢复，订单的收款、发货与跟进记录会一并移除，统计概览也会同步扣减。" alert-type="error" button-type="danger" confirm-text="确认删除" :items="confirmItems" :loading="confirmActing" @confirm="runConfirm" />
  </page>
</template>
<script setup lang="ts">
import { useActionModel } from '@/hooks';
import { permission } from '@/utils/permission';
import { computed, reactive, ref } from 'vue';
import { deleteApi, listApi, ORDER_STATUS, PAYMENT_STATUS, SHIPPING_STATUS, summaryApi } from '../../api/order';
import type { CmsOrder, CmsOrderAction, CmsOrderQuery } from '../../api/order';
import type { CmsConfirmItem } from '../../components/actionConfirm';
import ActionConfirm from '../../components/actionConfirm.vue';
import ActionDialog from './components/action.vue';
import OrderButtons from './components/buttons.vue';
import Detail from './components/detail.vue';
import { formatTime, statusOf } from './components/helper';

defineOptions({ name: 'AonCmsOrder' });
const params = reactive<CmsOrderQuery & { createdAt?: [string, string] }>({ page: 1, pageSize: 20, keyword: '', status: undefined, paymentStatus: undefined, shippingStatus: undefined, createdAt: undefined });
const { data, loading, runAsync, } = listApi();
const { data: summary, runAsync: loadSummary } = summaryApi();
const { runAsync: del } = deleteApi();
const activeCard = ref('');
const search = (page = params.page, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize }));
const refresh = () => Promise.all([search(), loadSummary()]);

const summaryCards = computed(() => [
  { key: 'all', label: '全部订单', value: summary.value?.total ?? 0, color: 'var(--el-text-color-primary)' },
  { key: 'pending', label: '待处理', value: summary.value?.pending ?? 0, color: 'var(--el-color-warning)' },
  { key: 'unpaid', label: '待收款', value: summary.value?.unpaid ?? 0, color: 'var(--el-color-danger)' },
  { key: 'toShip', label: '待发货', value: summary.value?.toShip ?? 0, color: 'var(--el-color-primary)' },
  { key: 'completed', label: '已完成', value: summary.value?.completed ?? 0, color: 'var(--el-color-success)' },
  { key: 'paid', label: '已收款金额', value: `¥${(summary.value?.paidAmount ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`, color: 'var(--el-color-success)' },
]);
/** 概览卡片快捷筛选 */
const applyCard = (key: string) => {
  if (key === 'paid') return;
  activeCard.value = key === 'all' ? '' : key;
  Object.assign(params, { status: undefined, paymentStatus: undefined, shippingStatus: undefined });
  if (key === 'pending') params.status = 0;
  if (key === 'unpaid') params.paymentStatus = 0;
  if (key === 'toShip') params.shippingStatus = 0;
  if (key === 'completed') params.status = 2;
  search(1);
};

const isOverdue = (row: CmsOrder) => (row.status === 0 || row.status === 1) && !!row.nextFollowAt && new Date(row.nextFollowAt).getTime() < Date.now();

const { open: openAction } = useActionModel(ActionDialog);
const onAction = (action: CmsOrderAction, row: CmsOrder) => openAction({ action, order: row, onSuccess: () => refresh() });
const { open: openDrawer } = useActionModel(Detail);
const openDetail = (id: string) => openDrawer({ id, onChanged: () => refresh() });

// 删除二次确认
const confirmVisible = ref(false);
const confirmRow = ref<CmsOrder>();
const confirmActing = ref(false);
const confirmItems = computed<CmsConfirmItem[]>(() => {
  const row = confirmRow.value;
  if (!row) return [];
  return [
    { label: '订单号', value: row.orderNo },
    { label: '商品', value: `${row.itemName} × ${row.quantity}` },
    { label: '金额', value: `¥${row.amount}` },
    { label: '收件人', value: `${row.contactName} ${row.contactPhone}` },
    { label: '订单状态', value: statusOf(ORDER_STATUS, row.status).label, tag: true, tagType: statusOf(ORDER_STATUS, row.status).type },
  ];
});
const openConfirm = (row: CmsOrder) => {
  confirmRow.value = row;
  confirmVisible.value = true;
};
const runConfirm = async () => {
  const row = confirmRow.value;
  if (!row) return;
  confirmActing.value = true;
  try {
    await del([row.id]);
    await refresh();
    confirmVisible.value = false;
  } catch {
    // 失败提示由请求层统一处理，保留弹窗便于确认后重试
  } finally {
    confirmActing.value = false;
  }
};
await refresh();
</script>
<style scoped>
.order-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
.order-summary__card {
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
  cursor: pointer;
  transition: all 0.2s;
}
.order-summary__card:hover,
.order-summary__card.is-active {
  border-color: var(--el-color-primary);
  box-shadow: 0 4px 12px rgb(64 158 255 / 12%);
}
.order-summary__label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.order-summary__value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 600;
}
.order-muted {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.order-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.order-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.order-overdue {
  color: var(--el-color-danger);
  font-weight: 600;
}
</style>
