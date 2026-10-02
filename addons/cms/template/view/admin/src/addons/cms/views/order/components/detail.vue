<template>
  <el-drawer v-model="show" :title="detail ? `订单 ${detail.order.orderNo}` : '订单详情'" size="min(720px, 100%)" @closed="emit('closed')">
    <div v-loading="loading" class="order-detail">
      <template v-if="detail">
        <el-steps :active="stepActive" :process-status="detail.order.status === 3 ? 'error' : 'process'" finish-status="success" align-center class="order-detail__steps">
          <el-step title="下单" :description="formatTime(detail.order.createdAt)" />
          <el-step title="收款" :description="formatTime(detail.order.paidAt)" />
          <el-step title="发货" :description="formatTime(detail.order.shippedAt)" />
          <el-step title="签收" :description="formatTime(detail.order.receivedAt)" />
          <el-step :title="detail.order.status === 3 ? '已关闭' : '完成'" :description="formatTime(detail.order.completedAt || detail.order.closedAt)" />
        </el-steps>

        <div class="order-detail__actions">
          <order-buttons :order="detail.order" @action="onAction" />
        </div>

        <el-descriptions title="订单信息" :column="2" border size="small">
          <el-descriptions-item label="订单号">{{ detail.order.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag size="small" effect="dark" :type="statusOf(ORDER_STATUS, detail.order.status).type">{{ statusOf(ORDER_STATUS, detail.order.status).label }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="商品" :span="2">
            <a v-if="detail.article" :href="`/aon/cms/article/${detail.article.slug}`" target="_blank" class="order-detail__link">{{ detail.order.itemName }}</a>
            <span v-else>{{ detail.order.itemName }}</span>
            × {{ detail.order.quantity }}
          </el-descriptions-item>
          <el-descriptions-item label="应收金额">¥{{ detail.order.amount }}</el-descriptions-item>
          <el-descriptions-item label="下单账号">{{ detail.order.userId ? `会员 ${detail.order.userId}` : '访客' }}</el-descriptions-item>
          <el-descriptions-item label="客户备注" :span="2">{{ detail.order.remark || '—' }}</el-descriptions-item>
          <el-descriptions-item label="内部备注" :span="2">{{ detail.order.adminRemark || '—' }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions title="收件信息" :column="2" border size="small">
          <el-descriptions-item label="收件人">{{ detail.order.contactName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ detail.order.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="收件地址" :span="2">{{ detail.order.shippingAddress }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions title="收款信息" :column="2" border size="small">
          <el-descriptions-item label="收款状态">
            <el-tag size="small" :type="statusOf(PAYMENT_STATUS, detail.order.paymentStatus).type">{{ statusOf(PAYMENT_STATUS, detail.order.paymentStatus).label }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="实收金额">{{ detail.order.paymentStatus === 0 ? '—' : `¥${detail.order.paidAmount}` }}</el-descriptions-item>
          <el-descriptions-item label="收款方式">{{ methodLabel || '—' }}</el-descriptions-item>
          <el-descriptions-item label="流水号">{{ detail.order.paymentNo || '—' }}</el-descriptions-item>
          <el-descriptions-item label="收款时间" :span="2">{{ formatTime(detail.order.paidAt) || '—' }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions title="物流信息" :column="2" border size="small">
          <el-descriptions-item label="发货状态">
            <el-tag size="small" :type="statusOf(SHIPPING_STATUS, detail.order.shippingStatus).type">{{ statusOf(SHIPPING_STATUS, detail.order.shippingStatus).label }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="快递公司">{{ detail.order.expressCompany || '—' }}</el-descriptions-item>
          <el-descriptions-item label="快递单号">
            <template v-if="detail.order.expressNo">
              {{ detail.order.expressNo }}
              <el-button link type="primary" size="small" @click="copy(detail.order.expressNo)">复制</el-button>
            </template>
            <span v-else>—</span>
          </el-descriptions-item>
          <el-descriptions-item label="发货时间">{{ formatTime(detail.order.shippedAt) || '—' }}</el-descriptions-item>
        </el-descriptions>

        <div class="order-detail__section">
          <div class="order-detail__title">
            跟进记录
            <span v-if="detail.order.nextFollowAt" class="order-detail__next">下次跟进：{{ formatTime(detail.order.nextFollowAt) }}</span>
          </div>
          <el-empty v-if="!detail.logs.length" description="暂无跟进记录" :image-size="60" />
          <el-timeline v-else>
            <el-timeline-item v-for="log in detail.logs" :key="log.id" :timestamp="formatTime(log.createdAt)" :type="LOG_ACTIONS[log.action]?.type" placement="top">
              <div class="order-detail__log">
                <el-tag size="small" :type="LOG_ACTIONS[log.action]?.type">{{ LOG_ACTIONS[log.action]?.label ?? log.action }}</el-tag>
                <span class="order-detail__log-admin">{{ log.createdAdmin?.nickname || log.createdAdmin?.username || '系统' }}</span>
              </div>
              <div class="order-detail__log-content">{{ log.content }}</div>
              <div v-if="log.nextFollowAt" class="order-detail__log-next">约定下次跟进：{{ formatTime(log.nextFollowAt) }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </template>
    </div>
  </el-drawer>
</template>
<script setup lang="ts">
import { useActionModel } from '@/hooks';
import { ElMessage } from 'element-plus';
import { computed, watch } from 'vue';
import { infoApi, LOG_ACTIONS, ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS, SHIPPING_STATUS } from '../../../api/order';
import type { CmsOrder, CmsOrderAction } from '../../../api/order';
import ActionDialog from './action.vue';
import OrderButtons from './buttons.vue';
import { formatTime, statusOf } from './helper';

const props = defineProps<{ id: string }>();
const emit = defineEmits<{ closed: []; changed: [] }>();
const show = defineModel<boolean>();
const { data: detail, loading, runAsync } = infoApi();
const load = () => runAsync(props.id);
watch(() => props.id, (id) => id && load(), { immediate: true });

const methodLabel = computed(() => PAYMENT_METHODS.find((m) => m.value === detail.value?.order.paymentMethod)?.label ?? '');
const stepActive = computed(() => {
  const o = detail.value?.order;
  if (!o) return 0;
  if (o.status === 2) return 5;
  if (o.status === 3) return 4;
  if (o.shippingStatus === 2) return 4;
  if (o.shippingStatus === 1) return o.paymentStatus === 1 ? 3 : 1;
  return o.paymentStatus === 1 ? 2 : 1;
});
const { open } = useActionModel(ActionDialog);
const onAction = (action: CmsOrderAction, order: CmsOrder) =>
  open({
    action,
    order,
    onSuccess: async () => {
      await load();
      emit('changed');
    },
  });
const copy = async (text: string) => {
  await navigator.clipboard?.writeText(text);
  ElMessage.success('已复制');
};
</script>
<style scoped>
.order-detail {
  min-height: 200px;
}
.order-detail__steps {
  margin-bottom: 16px;
}
.order-detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
.order-detail__actions :deep(.el-button + .el-button) {
  margin-left: 0;
}
.order-detail :deep(.el-descriptions) {
  margin-bottom: 20px;
}
.order-detail__link {
  color: var(--el-color-primary);
}
.order-detail__section {
  margin-top: 8px;
}
.order-detail__title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
}
.order-detail__next {
  margin-left: 12px;
  font-size: 13px;
  font-weight: 400;
  color: var(--el-color-warning);
}
.order-detail__log {
  display: flex;
  align-items: center;
  gap: 8px;
}
.order-detail__log-admin {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.order-detail__log-content {
  margin-top: 6px;
  white-space: pre-wrap;
  line-height: 1.6;
}
.order-detail__log-next {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-color-warning);
}
</style>
