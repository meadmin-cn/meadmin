<template>
  <me-dialog v-model="show" :title="t('编辑')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-form ref="formEl" v-loading="loading" :model="info" :rules="rules" class="add" label-width="auto">
      <el-form-item :label="t('文件名')" prop="name">
        <el-input v-model="info.name"></el-input>
      </el-form-item>
      <el-form-item :label="t('路径')" prop="path">
        <el-input v-model="info.path"></el-input>
      </el-form-item>
      <el-form-item :label="t('mime类型')" prop="mimeType">
        <el-input v-model="info.mimeType"></el-input>
      </el-form-item>
      <el-form-item :label="t('文件大小')" prop="size">
        <el-input-number v-model="info.size" :value-on-clear="null"></el-input-number>
      </el-form-item>
      <el-form-item :label="t('存储引擎')" prop="storage">
        <el-input v-model="info.storage"></el-input>
      </el-form-item>
      <el-form-item :label="t('文件MD5值')" prop="md5">
        <el-input v-model="info.md5"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <me-button @click="() => (show = false)">{{ t('取消') }}</me-button>
      <me-button type="primary" @click="submit">{{ t('提交') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="AddOrUpUserFile">
import { UserFile, updateUserFileApi, userFileInfoApi } from '@/api/userFile';
import { useLocalesI18n } from '@/locales/i18n';
import { resetObj } from '@/utils/helper';
import type { FormInstance, FormRules } from 'element-plus';

//接口需要现在setup顶层初始化（如果是异步setup需要在异步调用之前初始化），否则会有unMounted，非法调用警告，因为vueRequest使用了unMounted
const { runAsync: updateRunAsync } = updateUserFileApi();
const { runAsync: infoRunAsync } = userFileInfoApi();
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'userFile']);
await loadRes;

const show = defineModel<boolean>();
const props = defineProps<{
  id: string;
}>();
const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'closed'): void;
}>();

const info = reactive(new UserFile());
const loading = ref(false);
watch(
  () => props.id,
  async (id?: string) => {
    if (id) {
      loading.value = true;
      resetObj(info, await infoRunAsync(id));
      loading.value = false;
    }
  },
  { immediate: true },
);
const rules: FormRules = {
  name: [
    { required: true, message: t('{label} 必须填写', { label: t('文件名') }), trigger: 'blur' },
    { type: 'string', min: 1, max: 300, message: t('{label} 长度必须在 {min} 及 {max} 之间', { label: t('文件名'), min: 1, max: 300 }), trigger: 'blur' },
  ],
};
const formEl = ref<FormInstance>();
const submit = async () => {
  try {
    await formEl.value!.validate();
  } catch (invalidFields) {
    return formEl.value!.scrollToField(Object.keys(invalidFields!)[0]);
  }
  await updateRunAsync(props.id, info);

  show.value = false;
  emit('success');
};
</script>
