<template>
  <me-dialog v-model="show" :title="t(id ? '编辑配置组' : '新增配置组')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-form ref="formEl" v-loading="loading" :model="form" :rules="rules" label-width="auto">
      <el-form-item :label="t('组名称')" prop="groupName">
        <el-input v-model="form.groupName" :placeholder="t('请输入组名称')" />
      </el-form-item>
      <el-form-item :label="t('组编码')" prop="groupCode">
        <el-input v-model="form.groupCode" :disabled="builtin" :placeholder="t('请输入组编码')" />
      </el-form-item>
      <el-form-item :label="t('排序值')" prop="sortOrder">
        <el-input-number v-model="form.sortOrder" :disabled="builtin" :min="0" :precision="0" controls-position="right" />
      </el-form-item>
      <el-form-item :label="t('说明')" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item v-if="id" :label="t('状态')" prop="status">
        <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <me-button @click="show = false">{{ t('取消') }}</me-button>
      <me-button type="primary" :loading="loading" @click="submit">{{ t('确定') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="SystemConfigGroupDialog">
import type { SystemConfigGroupCreateParam } from '@/api/system/config.js';
import { addSystemConfigGroupApi, systemConfigGroupInfoApi, updateSystemConfigGroupApi } from '@/api/system/config.js';
import { useLocalesI18n } from '@/locales/i18n';
import type { FormInstance, FormRules } from 'element-plus';

const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'systemConfig']);
const show = defineModel<boolean>();
const props = defineProps<{ id?: string }>();
const emit = defineEmits<{ success: []; closed: [] }>();
const { runAsync: getInfo } = systemConfigGroupInfoApi();
const { runAsync: add } = addSystemConfigGroupApi();
const { runAsync: update } = updateSystemConfigGroupApi();
const form = reactive<SystemConfigGroupCreateParam & { status: number }>({
  groupCode: '',
  groupName: '',
  sortOrder: 100,
  description: '',
  status: 1,
});
const loading = ref(false);
const builtin = ref(false);
const formEl = ref<FormInstance>();
const rules: FormRules = {
  groupCode: [
    { required: true, message: t('{label} 必须填写', { label: t('组编码') }), trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/, message: t('组编码格式错误'), trigger: 'blur' },
  ],
  groupName: [{ required: true, message: t('{label} 必须填写', { label: t('组名称') }), trigger: 'blur' }],
};

const reset = () => {
  form.groupCode = '';
  form.groupName = '';
  form.sortOrder = 100;
  form.description = '';
  form.status = 1;
  builtin.value = false;
};

watch(
  () => props.id,
  async (id) => {
    reset();
    if (!id) return;
    loading.value = true;
    const info = await getInfo(id);
    form.groupCode = info.groupCode;
    form.groupName = info.groupName;
    form.sortOrder = info.sortOrder;
    form.description = info.description;
    form.status = info.status;
    builtin.value = info.isBuiltin;
    loading.value = false;
  },
  { immediate: true },
);

const submit = async () => {
  try {
    await formEl.value!.validate();
  } catch (invalidFields) {
    return formEl.value!.scrollToField(Object.keys(invalidFields!)[0]);
  }
  const data: SystemConfigGroupCreateParam = {
    groupCode: form.groupCode,
    groupName: form.groupName,
    sortOrder: form.sortOrder,
    description: form.description,
    status: form.status,
  };
  if (props.id) await update(props.id, builtin.value ? { groupName: data.groupName, description: data.description, status: data.status } : data);
  else await add(data);
  show.value = false;
  emit('success');
};

await loadRes;
</script>
