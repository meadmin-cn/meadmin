<template>
  <me-dialog v-model="show" :title="titles[action]" width="min(560px, calc(100% - 32px))" :close-on-click-modal="false" @closed="emit('closed')">
    <el-alert v-if="order" :closable="false" type="info" class="order-action-alert">
      <template #title>
        <span>{{ order.orderNo }}</span>
        <span class="order-action-alert__meta">{{ order.itemName }} × {{ order.quantity }}，应收 ¥{{ order.amount }}</span>
      </template>
    </el-alert>
    <el-form ref="formEl" :model="form" :rules="rules" label-width="96px" :disabled="saving">
      <template v-if="action === 'edit'">
        <el-form-item label="收件人" prop="contactName"><el-input v-model="form.contactName" maxlength="80" /></el-form-item>
        <el-form-item label="联系电话" prop="contactPhone"><el-input v-model="form.contactPhone" maxlength="30" :disabled="shipped" /></el-form-item>
        <el-form-item label="收件地址" prop="shippingAddress"><el-input v-model="form.shippingAddress" type="textarea" :rows="2" maxlength="500" :disabled="shipped" /></el-form-item>
        <el-form-item label="数量" prop="quantity"><el-input-number v-model="form.quantity" :min="1" :max="999" /></el-form-item>
        <el-form-item label="应收金额" prop="amount"><el-input-number v-model="form.amount" :min="0" :precision="2" :step="10" :disabled="paid" /></el-form-item>
        <el-form-item label="内部备注" prop="adminRemark"><el-input v-model="form.adminRemark" type="textarea" :rows="3" maxlength="1000" show-word-limit /></el-form-item>
      </template>
      <template v-else-if="action === 'pay'">
        <el-form-item label="实收金额" prop="paidAmount"><el-input-number v-model="form.paidAmount" :min="0" :precision="2" :step="10" /></el-form-item>
        <el-form-item label="收款方式" prop="paymentMethod">
          <el-radio-group v-model="form.paymentMethod"><el-radio-button v-for="item in PAYMENT_METHODS" :key="item.value" :value="item.value">{{ item.label }}</el-radio-button></el-radio-group>
        </el-form-item>
        <el-form-item label="流水号" prop="paymentNo"><el-input v-model="form.paymentNo" maxlength="80" placeholder="转账流水号/凭证号，可选" /></el-form-item>
        <el-form-item label="收款时间" prop="paidAt"><el-date-picker v-model="form.paidAt" type="datetime" value-format="YYYY-MM-DDTHH:mm:ssZ" placeholder="默认当前时间" /></el-form-item>
        <el-form-item label="备注" prop="content"><el-input v-model="form.content" type="textarea" :rows="2" maxlength="1000" /></el-form-item>
      </template>
      <template v-else-if="action === 'ship'">
        <el-form-item label="收件信息"><div class="order-action-address">{{ order?.contactName }} {{ order?.contactPhone }}<br />{{ order?.shippingAddress }}</div></el-form-item>
        <el-form-item label="快递公司" prop="expressCompany">
          <el-select v-model="form.expressCompany" filterable allow-create default-first-option placeholder="选择或输入快递公司" style="width: 100%">
            <el-option v-for="item in EXPRESS_COMPANIES" :key="item" :value="item" :label="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号" prop="expressNo"><el-input v-model="form.expressNo" maxlength="60" /></el-form-item>
        <el-form-item label="发货时间" prop="shippedAt"><el-date-picker v-model="form.shippedAt" type="datetime" value-format="YYYY-MM-DDTHH:mm:ssZ" placeholder="默认当前时间" /></el-form-item>
        <el-form-item label="备注" prop="content"><el-input v-model="form.content" type="textarea" :rows="2" maxlength="1000" /></el-form-item>
      </template>
      <template v-else-if="action === 'follow'">
        <el-form-item label="跟进内容" prop="content"><el-input v-model="form.content" type="textarea" :rows="4" maxlength="1000" show-word-limit placeholder="如：已电话联系客户确认收货地址" /></el-form-item>
        <el-form-item label="下次跟进" prop="nextFollowAt"><el-date-picker v-model="form.nextFollowAt" type="datetime" value-format="YYYY-MM-DDTHH:mm:ssZ" :disabled-date="(d: Date) => d.getTime() < Date.now() - 86400000" placeholder="可选" /></el-form-item>
      </template>
      <template v-else>
        <el-alert v-if="action === 'close' && paid" type="warning" :closable="false" title="该订单已收款，关闭后将标记为已退款，请确认已线下退款。" class="order-action-alert" />
        <el-form-item :label="action === 'close' ? '关闭原因' : '说明'" prop="content"><el-input v-model="form.content" type="textarea" :rows="3" maxlength="1000" /></el-form-item>
      </template>
    </el-form>
    <template #footer>
      <el-button @click="show = false">取消</el-button>
      <el-button :type="action === 'close' ? 'danger' : 'primary'" :loading="saving" @click="submit">确定</el-button>
    </template>
  </me-dialog>
</template>
<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { computed, reactive, ref } from 'vue';
import dayjs from 'dayjs';
import { actionApi, EXPRESS_COMPANIES, PAYMENT_METHODS } from '../../../api/order';
import type { CmsOrder, CmsOrderAction } from '../../../api/order';

const props = defineProps<{ action: CmsOrderAction; order: CmsOrder }>();
const emit = defineEmits<{ success: []; closed: [] }>();
const show = defineModel<boolean>();
const titles: Record<CmsOrderAction, string> = { edit: '编辑订单', pay: '确认收款', ship: '发货 / 录入快递', receive: '确认签收', follow: '添加跟进', complete: '完成订单', close: '关闭订单' };
const shipped = computed(() => props.order.shippingStatus !== 0);
const paid = computed(() => props.order.paymentStatus === 1);
const formEl = ref<FormInstance>();
const o = props.order;
const now = () => dayjs().format('YYYY-MM-DDTHH:mm:ssZ');
const form = reactive<Record<string, any>>(
  props.action === 'edit'
    ? { contactName: o.contactName, contactPhone: o.contactPhone, shippingAddress: o.shippingAddress, quantity: o.quantity, amount: Number(o.amount), adminRemark: o.adminRemark }
    : props.action === 'pay'
      ? { paidAmount: Number(o.amount), paymentMethod: 'bank', paymentNo: '', paidAt: now(), content: '' }
      : props.action === 'ship'
        ? { expressCompany: o.expressCompany || '', expressNo: o.expressNo || '', shippedAt: now(), content: '' }
        : props.action === 'follow'
          ? { content: '', nextFollowAt: null }
          : { content: '' },
);
const required = (message: string) => [{ required: true, message, trigger: 'blur' }];
const rules: FormRules = {
  contactName: required('请输入收件人'),
  contactPhone: [...required('请输入联系电话'), { min: 5, message: '联系电话至少 5 位', trigger: 'blur' }],
  shippingAddress: [...required('请输入收件地址'), { min: 5, message: '地址至少 5 个字', trigger: 'blur' }],
  paidAmount: required('请输入实收金额'),
  paymentMethod: required('请选择收款方式'),
  expressCompany: required('请选择快递公司'),
  expressNo: [...required('请输入快递单号'), { pattern: /^[A-Za-z0-9-]{3,60}$/, message: '快递单号只能包含字母、数字和横线', trigger: 'blur' }],
  content: props.action === 'follow' || props.action === 'close' ? required(props.action === 'close' ? '请填写关闭原因' : '请填写跟进内容') : [],
};
const { runAsync, loading: saving } = actionApi();
const submit = async () => {
  if (!(await formEl.value?.validate().catch(() => false))) return;
  const data = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== null && v !== undefined));
  await runAsync(props.action, props.order.id, data);
  show.value = false;
  emit('success');
};
</script>
<style scoped>
.order-action-alert {
  margin-bottom: 16px;
}
.order-action-alert__meta {
  margin-left: 12px;
  color: var(--el-text-color-secondary);
}
.order-action-address {
  line-height: 1.6;
  color: var(--el-text-color-regular);
}
</style>
