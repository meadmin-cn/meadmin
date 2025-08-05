<template>
  <me-dialog v-loading="loading" v-model="show" :title="t(info.id ? '编辑' : '新增')" :close-on-click-modal="false"
    @closed="$emit('closed')">
    <el-form ref="formEl" :model="info" :rules="rules" class="add" label-width="auto">
      <el-form-item :label="t('用户名')" prop="username">
        <el-input v-model="info.username"></el-input>
      </el-form-item>
      <el-form-item :label="t('昵称')" prop="nickname">
        <el-input v-model="info.nickname"></el-input>
      </el-form-item>
      <el-form-item :label="t('密码')" prop="type">
        <el-input v-model="info.password"></el-input>
      </el-form-item>
      <el-form-item :label="t('头像')" prop="avatar">
        <el-input v-model="info.avatar"></el-input>
      </el-form-item>
      <el-form-item :label="t('手机号')" prop="mobile">
        <el-input v-model="info.mobile"></el-input>
      </el-form-item>
      <el-form-item :label="t('邮箱')" prop="email">
        <el-input v-model="info.email"></el-input>
      </el-form-item>
      <el-form-item :label="t('超级管理员')" prop="isSuper">
        <el-input v-model="info.email"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <me-button type="primary" @click="submit">{{ t('提交') }}</me-button>
      <me-button @click="() => show = false">{{ t('取消') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="AddOrUp">
import { AddAdminParam, addAdminApi, upAdminApi, adminInfoApi } from '@/api/admin';
import { useLocalesI18n } from '@/locales/i18n';
import { resetObj } from '@/utils/helper';
import { FormInstance, FormRules } from 'element-plus';
let { t } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'demo']);
const show = defineModel<boolean>();
const props = defineProps<{
  id?: string;
}>();
const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'closed'): void;
}>();
const info = reactive(new AddAdminParam());
const loading = ref(false);
watch(
  () => props.id,
  async (id) => {
    if (id) {
      loading.value = true;
      resetObj(info, await adminInfoApi().runAsync(id));
      loading.value = false;
    }
  },
  { immediate: true },
);
const rules: FormRules = {
  username: { required: true, message: t('请填写') + t('用户名'), trigger: 'blur' },
  nickname: { required: true, message: t('请填写') + t('昵称'), trigger: 'blur' },
  password: { required: true, message: t('请选择') + t('密码'), trigger: 'blur' },
  avatarImage: { required: true, message: t('请填写') + t('头像'), trigger: 'blur' },
  email: { required: true, message: t('请填写') + t('邮箱'), trigger: 'blur' },
  isSuper: { required: true, message: t('请选择') + t('超级管理员'), trigger: 'blur' },
  mobile: { required: true, message: t('请填写') + t('手机号'), trigger: 'blur' },
};
const formEl = ref<FormInstance>();
const submit = async () => {
  try {
    await formEl.value!.validate();
  } catch (invalidFields) {
    return formEl.value!.scrollToField(Object.keys(invalidFields!)[0]);
  }
  if (props.id) {
    await upAdminApi().runAsync(props.id, info);
  } else {
    await addAdminApi().runAsync(info);
  }
  show.value = false;
  emit('success');
}
</script>
