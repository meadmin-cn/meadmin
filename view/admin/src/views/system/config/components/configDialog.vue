<template>
  <me-dialog v-model="show" :title="t(id ? '编辑配置项' : '新增配置项')" width="720px" :close-on-click-modal="false" @closed="emit('closed')">
    <el-form ref="formEl" v-loading="loading" :model="form" :rules="rules" label-width="auto">
      <el-form-item :label="t('变量标识')" prop="variableCode">
        <el-input v-model="form.variableCode" :disabled="!!id && builtin" />
      </el-form-item>
      <el-form-item :label="t('变量标题')" prop="variableTitle">
        <el-input v-model="form.variableTitle" />
      </el-form-item>
      <el-form-item :label="t('变量类型')" prop="variableType">
        <el-input v-if="props.groupType === 'dict'" :model-value="t('字典')" disabled />
        <el-select v-else v-model="form.variableType" :disabled="!!id && builtin" @change="resetValueForType">
          <el-option v-for="item in dict.variableType.filter((item) => props.groupType === 'custom' || item.value !== 'dict')" :key="item.value" :value="item.value" :label="item.label" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="!builtin" :label="t('配置分组')" prop="groupId">
        <el-input v-if="props.groupType === 'dict'" :model-value="groups.find((group) => group.id === form.groupId)?.groupName ?? t('字典配置')" disabled />
        <el-select v-else v-model="form.groupId" :disabled="!!id">
          <el-option v-for="group in groups" :key="group.id" :value="group.id" :label="group.groupName" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('排序值')" prop="sortOrder">
        <el-input-number v-model="form.sortOrder" :min="0" :precision="0" controls-position="right" />
      </el-form-item>
      <el-form-item :label="t('默认值')">
        <el-input-number v-if="form.variableType === 'number'" v-model="numberValue" controls-position="right" />
        <el-input v-else-if="['text', 'textarea', 'multiline'].includes(form.variableType)" v-model="stringValue" type="textarea" :rows="form.variableType === 'multiline' ? 6 : 3" />
        <div v-else-if="form.variableType === 'array'" class="editor-table">
          <div v-for="(item, index) in arrayItems" :key="item.key" class="editor-row">
            <el-input v-model="item.value" :placeholder="t('数组项')" />
            <el-input-number v-model="item.sort" :min="0" :precision="0" controls-position="right" />
            <el-button type="danger" link :title="t('删除')" @click="arrayItems.splice(index, 1)"><mel-icon-delete /></el-button>
          </div>
          <el-button type="primary" link @click="addArrayItem"><mel-icon-plus />{{ t('新增项') }}</el-button>
        </div>
        <div v-else class="editor-table">
          <div v-for="(item, index) in objectItems" :key="item.key" class="editor-row">
            <el-input v-model="item.key" :placeholder="t('标题')" />
            <el-input v-model="item.value" :placeholder="t('值')" />
            <el-input-number v-model="item.sort" :min="0" :precision="0" controls-position="right" />
            <el-select v-if="form.variableType === 'dict'" v-model="item.status" class="status-select">
              <el-option v-for="status in dict.configStatus" :key="status.value" :value="status.value" :label="status.label" />
            </el-select>
            <el-button type="danger" link :title="t('删除')" @click="objectItems.splice(index, 1)"><mel-icon-delete /></el-button>
          </div>
          <el-button type="primary" link @click="addObjectItem"><mel-icon-plus />{{ t(form.variableType === 'dict' ? '新增选项' : '新增键值对') }}</el-button>
        </div>
      </el-form-item>
      <el-form-item :label="t('必填项')">
        <el-switch v-model="form.isRequired" />
      </el-form-item>
      <el-form-item :label="t('状态')">
        <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
      </el-form-item>
      <el-form-item :label="t('说明')">
        <el-input v-model="form.description" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <me-button @click="show = false">{{ t('取消') }}</me-button>
      <me-button type="primary" @click="submit">{{ t('确定') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="SystemConfigDialog">
import type { SystemConfigGroupInfo, SystemConfigOption, SystemConfigValue, SystemConfigVariableType } from '@/api/system/config.js';
import { addSystemConfigApi, addSystemDictApi, systemConfigInfoApi, updateSystemConfigApi, updateSystemDictApi } from '@/api/system/config.js';
import { useLocalesI18n } from '@/locales/i18n';
import type { FormInstance, FormRules } from 'element-plus';
import { getDict } from '../dict.js';

const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'systemConfig']);
const dict = getDict(t);
const show = defineModel<boolean>();
const props = defineProps<{ id?: string; groupId: string; groupType: 'base' | 'dict' | 'custom'; groups: SystemConfigGroupInfo[] }>();
const emit = defineEmits<{ success: []; closed: [] }>();
const { runAsync: getInfo } = systemConfigInfoApi();
const { runAsync: add } = addSystemConfigApi();
const { runAsync: update } = updateSystemConfigApi();
const { runAsync: addDict } = addSystemDictApi();
const { runAsync: updateDict } = updateSystemDictApi();
const isDict = () => props.groupType === 'dict';
const formEl = ref<FormInstance>();
const loading = ref(false);
const builtin = ref(false);
const form = reactive<{
  variableCode: string;
  variableTitle: string;
  variableType: SystemConfigVariableType;
  groupId: string;
  value: SystemConfigValue;
  options: SystemConfigOption[];
  sortOrder: number;
  isRequired: boolean;
  status: number;
  description: string;
}>({
  variableCode: '',
  variableTitle: '',
  variableType: 'string',
  groupId: props.groupId,
  value: '',
  options: [],
  sortOrder: 100,
  isRequired: false,
  status: 1,
  description: '',
});
const arrayItems = ref<{ key: number; value: string; sort: number }[]>([]);
const objectItems = ref<{ key: string; value: string; sort: number; status: number }[]>([]);
const stringValue = computed({
  get: () => (typeof form.value === 'string' ? form.value : ''),
  set: (value: string) => {
    form.value = value;
  },
});
const numberValue = computed({
  get: () => (typeof form.value === 'number' ? form.value : null),
  set: (value: number | undefined) => {
    form.value = value === undefined ? null : value;
  },
});
const rules: FormRules = {
  variableCode: [
    { required: true, message: t('{label} 必须填写', { label: t('变量标识') }), trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/, message: t('变量名格式错误'), trigger: 'blur' },
  ],
  variableTitle: [{ required: true, message: t('{label} 必须填写', { label: t('变量标题') }), trigger: 'blur' }],
  variableType: [{ required: true, message: t('{label} 必须填写', { label: t('变量类型') }), trigger: 'change' }],
  groupId: [{ required: true, message: t('{label} 必须填写', { label: t('配置分组') }), trigger: 'change' }],
};

const parseEditor = () => {
  arrayItems.value = [];
  objectItems.value = [];
  if (form.variableType === 'array' && Array.isArray(form.value)) {
    arrayItems.value = form.value.map((value, index) => ({ key: index, value: String(value), sort: index + 1 }));
  }
  if ((form.variableType === 'keyvalue' || form.variableType === 'dict') && form.value && !Array.isArray(form.value) && typeof form.value === 'object') {
    objectItems.value = Object.entries(form.value).map(([key, value], index) => ({
      key,
      value: String(value),
      sort: index + 1,
      status: form.options.find((option) => String(option.value) === key)?.status ?? 1,
    }));
  }
};
const reset = () => {
  form.variableCode = '';
  form.variableTitle = '';
  form.variableType = props.groupType === 'dict' ? 'dict' : 'string';
  form.groupId = props.groupId;
  form.value = '';
  form.options = [];
  form.sortOrder = 100;
  form.isRequired = false;
  form.status = 1;
  form.description = '';
  builtin.value = false;
  parseEditor();
};
const resetValueForType = (type: SystemConfigVariableType) => {
  if (props.groupType === 'dict') type = 'dict';
  if (type === 'number') form.value = null;
  else if (type === 'array') form.value = [];
  else if (type === 'keyvalue' || type === 'dict') form.value = {};
  else form.value = '';
  form.options = [];
  parseEditor();
};
const addArrayItem = () => {
  arrayItems.value.push({ key: Date.now(), value: '', sort: arrayItems.value.length + 1 });
};
const addObjectItem = () => {
  objectItems.value.push({ key: '', value: '', sort: objectItems.value.length + 1, status: 1 });
};
const buildValue = () => {
  if (form.variableType === 'array') return [...arrayItems.value].sort((a, b) => a.sort - b.sort).map((item) => item.value);
  if (form.variableType === 'keyvalue' || form.variableType === 'dict') {
    return Object.fromEntries(
      [...objectItems.value]
        .sort((a, b) => a.sort - b.sort)
        .filter((item) => item.key)
        .map((item) => [item.key, item.value]),
    );
  }
  return form.value;
};

watch(
  () => [props.id, props.groupId],
  async ([id]) => {
    reset();
    if (!id) return;
    loading.value = true;
    const info = await getInfo(id as string);
    let value = info.value;
    if (['array', 'keyvalue', 'dict'].includes(info.variableType) && typeof value === 'string') {
      try {
        value = JSON.parse(value) as SystemConfigValue;
      } catch {
        value = info.variableType === 'array' ? [] : {};
      }
    }
    Object.assign(form, {
      variableCode: info.variableCode,
      variableTitle: info.variableTitle,
      variableType: props.groupType === 'dict' ? 'dict' : info.variableType,
      groupId: info.groupId,
      value,
      options: (info.options ?? []).map((option) => ({ ...option })),
      sortOrder: info.sortOrder,
      isRequired: info.isRequired,
      status: info.status,
      description: info.description,
    });
    builtin.value = info.isBuiltin;
    parseEditor();
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
  const value = buildValue();
  const options = form.variableType === 'dict' ? objectItems.value.map((item) => ({ label: item.value, value: item.key, sort: item.sort, status: item.status })) : form.options;
  const data = {
    variableCode: form.variableCode,
    variableTitle: form.variableTitle,
    variableType: form.variableType,
    groupId: form.groupId,
    value,
    options,
    sortOrder: form.sortOrder,
    isRequired: form.isRequired,
    status: form.status,
    description: form.description,
  };
  if (props.id) {
    if (isDict()) {
      await updateDict(props.id, data);
    } else if (builtin.value) {
      await update(props.id, { variableTitle: data.variableTitle, value: data.value, options: data.options, sortOrder: data.sortOrder, isRequired: data.isRequired, status: data.status, description: data.description });
    } else await update(props.id, data);
  } else if (isDict()) await addDict(data);
  else await add(data);
  show.value = false;
  emit('success');
};

await loadRes;
</script>

<style lang="scss" scoped>
.editor-table {
  width: 100%;
}
.editor-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  .el-input,
  .el-input-number,
  .el-select {
    flex: 1;
    min-width: 0;
  }
  .status-select {
    max-width: 110px;
  }
}
</style>
