<template>
  <me-dialog v-model="show" :title="t(id ? '编辑' : '新增')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-form v-loading="loading" ref="formEl" :model="info" :rules="rules" class="add" label-width="auto">
      <el-form-item :label="t('手机号')" prop="mobile">
        <el-input v-model="info.mobile"></el-input>
      </el-form-item>
      <el-form-item :label="t('类型')" prop="type">
        <el-select v-model="info.type">
          <el-option v-for="val in dict.type" :key="val.value" :value="val.value" :label="val.label" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('名称')" prop="name">
        <el-input v-model="info.name"></el-input>
      </el-form-item>
      <el-form-item :label="t('头像')" prop="avatar">
        <me-upload list-type="picture" :limit="1" :model-value="info.avatar ? [info.avatar] : []" @update:modelValue="(files) => (info.avatar = files.length ? files[0] : null)"></me-upload>
      </el-form-item>
      <el-form-item :label="t('附件')" prop="files">
        <me-upload list-type="picture" v-model="info.files"></me-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <me-button @click="() => (show = false)">{{ t('取消') }}</me-button>
      <me-button type="primary" @click="submit">{{ t('提交') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="AddOrUpExampleDemo">
import { ExampleDemo, addExampleDemoApi, exampleDemoInfoApi, updateExampleDemoApi } from '@/api/example/demo';
import { useLocalesI18n } from '@/locales/i18n';
import { resetObj } from '@/utils/helper';
import { isMobile } from '@/utils/validate.js';
import { FormInstance, FormRules } from 'element-plus';
import { getDict } from '../dict.js';
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'exampleDemo']);
await loadRes;
const dict = getDict(t);
const show = defineModel<boolean>();
const props = defineProps<{
  id?: string;
}>();
const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'closed'): void;
}>();
const info = reactive(new ExampleDemo());
const loading = ref(false);
watch(
  () => props.id,
  async (id?: string) => {
    if (id) {
      loading.value = true;
      resetObj(info, await exampleDemoInfoApi({ noLoading: true }).runAsync(id));
      loading.value = false;
    }
  },
  { immediate: true },
);
const rules: FormRules = {
  mobile: [
    { required: true, message: t('{label} 必须填写', { label: t('手机号') }), trigger: 'blur' },
    { validator: (rule, value: string | number) => isMobile(value), message: t('{label} 必须是正确的手机号', { label: t('手机号') }), trigger: 'blur' },
  ],
  type: [{ required: true, message: t('{label} 必须填写', { label: t('类型') }), trigger: 'blur' }],
  name: [
    { required: true, message: t('{label} 必须填写', { label: t('名称') }), trigger: 'blur' },
    { type: 'string', min: 1, max: 20, message: t('{label} 长度必须在 {min} 及 {max} 之间', { label: t('名称'), min: 1, max: 20 }), trigger: 'blur' },
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
    await updateExampleDemoApi().runAsync(props.id, info);
  } else {
    await addExampleDemoApi().runAsync(info);
  }
  show.value = false;
  emit('success');
};
</script>
