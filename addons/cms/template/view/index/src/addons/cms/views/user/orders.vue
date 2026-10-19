<template>
  <div class="orders">
    <div class="orders-header">
      <div>
        <h2>我的订单</h2>
        <p>当前账号提交的 CMS 订单</p>
      </div>
      <el-button :loading="loading" @click="loadOrders()">刷新</el-button>
    </div>

    <el-empty v-if="!loading && !orderData?.list?.length" description="暂无订单" />
    <div v-else v-loading="loading" class="order-list">
      <article v-for="order in orderData?.list ?? []" :key="order.orderNo" class="order-item">
        <div class="order-item-header">
          <div>
            <strong>{{ order.itemName }}</strong>
            <span>订单号：{{ order.orderNo }}</span>
          </div>
          <div class="order-statuses">
            <el-tag size="small" :type="statusType(order.status)">{{ statusLabel(order.status) }}</el-tag>
            <el-tag size="small" effect="plain">{{ paymentLabel(order.paymentStatus) }}</el-tag>
            <el-tag size="small" effect="plain">{{ shippingLabel(order.shippingStatus ?? 0) }}</el-tag>
          </div>
        </div>
        <div class="order-item-body">
          <div>
            <span>数量</span><strong>{{ order.quantity }}</strong>
          </div>
          <div>
            <span>应收金额</span><strong>¥{{ order.amount }}</strong>
          </div>
          <div>
            <span>联系电话</span><strong>{{ order.contactPhone }}</strong>
          </div>
          <div>
            <span>提交时间</span><strong>{{ formatDate(order.createdAt) }}</strong>
          </div>
        </div>
        <div class="order-item-footer">
          <span>收件人：{{ order.contactName }}</span>
          <span>收货地址：{{ order.shippingAddress }}</span>
          <span v-if="order.expressNo">物流：{{ order.expressCompany }} {{ order.expressNo }}</span>
        </div>
      </article>
    </div>

    <el-pagination v-if="orderData?.total" v-model:current-page="page" :page-size="orderData.pageSize || pageSize" :total="orderData.total" layout="prev, pager, next" class="pagination" @current-change="loadOrders" />
  </div>
</template>

<script setup lang="ts" name="UserOrders">
import { myOrdersApi } from '@/addons/cms/api/cms';
import { formatterAtExec } from '@/utils/helper';
import { onMounted, ref } from 'vue';

const page = ref(1);
const pageSize = 10;
const { runAsync: getOrders, data: orderData, loading } = myOrdersApi();
const statusLabel = (value: number) => ['待处理', '处理中', '已完成', '已关闭'][value] ?? '未知';
const statusType = (value: number): 'success' | 'info' | 'warning' | undefined => (value === 2 ? 'success' : value === 3 ? 'info' : value === 1 ? 'warning' : undefined);
const paymentLabel = (value: number) => ['待线下支付', '已确认', '已取消'][value] ?? '未知';
const shippingLabel = (value: number) => ['未发货', '已发货', '已签收'][value] ?? '未知';
const formatDate = (date?: string) => formatterAtExec(date, 'YYYY-MM-DD HH:mm');
const loadOrders = async (nextPage = page.value) => {
  page.value = nextPage;
  await getOrders({ page: nextPage, pageSize });
};
onMounted(() => loadOrders());
</script>

<style lang="scss" scoped>
.orders {
  min-width: 0;
}
.orders-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  h2 {
    margin: 0;
    color: #202b3d;
    font-size: 20px;
  }
  p {
    margin: 7px 0 0;
    color: #8c95a4;
    font-size: 13px;
  }
}
.order-list {
  display: grid;
  gap: 14px;
}
.order-item {
  padding: 16px;
  border: 1px solid #e7ebf2;
  border-radius: 8px;
  background: #fff;
}
.order-item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 13px;
  border-bottom: 1px solid #edf0f5;
  strong,
  span {
    display: block;
  }
  strong {
    color: #253148;
    font-size: 15px;
    line-height: 1.5;
  }
  span {
    margin-top: 4px;
    color: #8c95a4;
    font-size: 12px;
  }
}
.order-statuses {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}
.order-item-body {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  padding: 14px 0;
  div {
    min-width: 0;
  }
  span,
  strong {
    display: block;
  }
  span {
    margin-bottom: 5px;
    color: #8c95a4;
    font-size: 12px;
  }
  strong {
    overflow: hidden;
    color: #37445b;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.order-item-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  padding-top: 12px;
  color: #667085;
  font-size: 12px;
  line-height: 1.6;
  border-top: 1px solid #edf0f5;
}
.pagination {
  justify-content: center;
  margin-top: 22px;
}
@media (max-width: 720px) {
  .order-item-header {
    flex-direction: column;
  }
  .order-statuses {
    justify-content: flex-start;
  }
  .order-item-body {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
