<template>
  <template v-for="item in buttons" :key="item.action">
    <el-button :link="link" :size="link ? undefined : 'default'" :type="item.type" :plain="!link" @click="emit('action', item.action, order)">{{ item.label }}</el-button>
  </template>
</template>
<script setup lang="ts">
import { permission } from '@/utils/permission';
import { computed } from 'vue';
import type { CmsOrder, CmsOrderAction } from '../../../api/order';
import { availableActions } from './helper';

const props = defineProps<{ order: CmsOrder; link?: boolean; limit?: number }>();
const emit = defineEmits<{ action: [CmsOrderAction, CmsOrder] }>();
const meta: Record<CmsOrderAction, { label: string; type: 'primary' | 'success' | 'warning' | 'danger' | 'info'; rule: string }> = {
  pay: { label: '确认收款', type: 'success', rule: 'aon_cms_order_pay' },
  ship: { label: '发货', type: 'primary', rule: 'aon_cms_order_ship' },
  receive: { label: '确认签收', type: 'success', rule: 'aon_cms_order_ship' },
  follow: { label: '跟进', type: 'warning', rule: 'aon_cms_order_follow' },
  edit: { label: '编辑', type: 'info', rule: 'aon_cms_order_edit' },
  complete: { label: '完成', type: 'success', rule: 'aon_cms_order_complete' },
  close: { label: '关闭', type: 'danger', rule: 'aon_cms_order_close' },
};
const buttons = computed(() => {
  const list = availableActions(props.order)
    .filter((action) => permission(meta[action].rule))
    .map((action) => ({ action, ...meta[action], label: action === 'ship' && props.order.shippingStatus === 1 ? '修改快递' : meta[action].label }));
  return props.limit ? list.slice(0, props.limit) : list;
});
</script>
