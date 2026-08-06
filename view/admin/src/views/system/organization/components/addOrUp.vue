<template>
  <me-dialog v-model="show" :title="t(id ? '编辑' : '新增')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-form ref="formEl" v-loading="loading" :model="info" :rules="rules" class="add" label-width="auto">
      <el-form-item :label="t('父级id')" prop="parentId">
        <el-tree-select v-model="info.parentId" :data="treeAllList || []" check-strictly node-key="id" :props="{ label: 'orgName' }" :render-after-expand="false" />
      </el-form-item>
      <el-form-item :label="t('组织名称')" prop="orgName">
        <el-input v-model="info.orgName"></el-input>
      </el-form-item>
      <el-form-item :label="t('排序(降序)')" prop="orderNum">
        <el-input-number v-model="info.orderNum" :value-on-clear="null"></el-input-number>
      </el-form-item>
      <el-form-item :label="t('状态')" prop="status">
        <el-select v-model="info.status" :value-on-clear="null">
          <el-option v-for="val in dict.status" :key="val.value" :value="val.value" :label="val.label" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('备注')" prop="remark">
        <el-input v-model="info.remark"></el-input>
      </el-form-item>
      <el-form-item :label="t('负责人')" prop="leader">
        <el-input v-model="info.leader"></el-input>
      </el-form-item>
      <el-form-item :label="t('联系电话')" prop="phone">
        <el-input v-model="info.phone"></el-input>
      </el-form-item>
      <el-form-item :label="t('邮箱')" prop="email">
        <el-input v-model="info.email"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <me-button @click="() => (show = false)">{{ t('取消') }}</me-button>
      <me-button type="primary" @click="submit">{{ t('提交') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="AddOrUpSystemOrganization">
import { SystemOrganization, type SystemOrganizationInfo, addSystemOrganizationApi, systemOrganizationInfoApi, systemOrganizationTreeAllApi, updateSystemOrganizationApi } from '@/api/system/organization';
import { useLocalesI18n } from '@/locales/i18n';
import type { FormInstance, FormRules } from 'element-plus';
import { getDict } from '../dict.js';

//接口需要现在setup顶层初始化（如果是异步setup需要在异步调用之前初始化），否则会有unMounted，非法调用警告，因为vueRequest使用了unMounted
const { runAsync: updateRunAsync } = updateSystemOrganizationApi();
const { runAsync: addRunAsync } = addSystemOrganizationApi();
const { runAsync: infoRunAsync } = systemOrganizationInfoApi();
const { data: treeAllList, runAsync: getTreeAllAsync } = systemOrganizationTreeAllApi();

let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'systemOrganization']);
await Promise.all([loadRes, getTreeAllAsync()]);
const dict = getDict(t);
const show = defineModel<boolean>();
const props = defineProps<{
  id?: string;
}>();
const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'closed'): void;
}>();

const info = ref<SystemOrganization | SystemOrganizationInfo>(new SystemOrganization());
const loading = ref(false);
watch(
  () => props.id,
  async (id?: string) => {
    if (id) {
      loading.value = true;
      info.value = await infoRunAsync(id);
      loading.value = false;
    }
  },
  { immediate: true },
);
const rules: FormRules = {
  parentId: [{ type: 'string', max: 100, message: t('{label} 长度必须小于等于 {max}', { label: t('父级id'), max: 100 }), trigger: 'blur' }],
  orgName: [
    { required: true, message: t('{label} 必须填写', { label: t('组织名称') }), trigger: 'blur' },
    { type: 'string', min: 1, max: 50, message: t('{label} 长度必须在 {min} 及 {max} 之间', { label: t('组织名称'), min: 1, max: 50 }), trigger: 'blur' },
  ],
  orderNum: [{ type: 'number', max: 9999, message: t('{label} 必须小于等于 {max}', { label: t('排序(降序)'), max: 9999 }), trigger: 'blur' }],
  remark: [{ type: 'string', min: 1, max: 100, message: t('{label} 长度必须在 {min} 及 {max} 之间', { label: t('备注'), min: 1, max: 100 }), trigger: 'blur' }],
  leader: [{ type: 'string', min: 1, max: 100, message: t('{label} 长度必须在 {min} 及 {max} 之间', { label: t('负责人'), min: 1, max: 100 }), trigger: 'blur' }],
  phone: [{ type: 'string', min: 1, max: 100, message: t('{label} 长度必须在 {min} 及 {max} 之间', { label: t('联系电话'), min: 1, max: 100 }), trigger: 'blur' }],
  email: [
    { type: 'string', min: 1, max: 100, message: t('{label} 长度必须在 {min} 及 {max} 之间', { label: t('邮箱'), min: 1, max: 100 }), trigger: 'blur' },
    { type: 'email', message: t('{label} 必须是正确的邮箱格式', { label: t('邮箱') }), trigger: 'blur' },
  ],
};
const formEl = ref<FormInstance>();
const submit = async () => {
  try {
    await formEl.value!.validate();
  } catch (invalidFields) {
    return formEl.value!.scrollToField(Object.keys(invalidFields!)[0]);
  }
  if (props.id) {
    await updateRunAsync(props.id, info.value);
  } else {
    await addRunAsync(info.value);
  }
  show.value = false;
  emit('success');
};
</script>
