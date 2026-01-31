<template>
  <me-dialog v-model="show" :title="t(id ? '编辑' : '新增')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-form ref="formEl" v-loading="loading" :model="info" :rules="rules" class="add" label-width="auto">
      <el-form-item :label="t('用户名')" prop="username">
        <el-input v-model="info.username"></el-input>
      </el-form-item>
      <el-form-item :label="t('昵称')" prop="nickname">
        <el-input v-model="info.nickname"></el-input>
      </el-form-item>
      <el-form-item :label="t('密码')" prop="password">
        <el-input v-model="info.password"></el-input>
      </el-form-item>
      <el-form-item :label="t('头像')" prop="avatar">
        <me-upload-user-file
          list-type="picture"
          :limit="1"
          :model-value="info.avatar ? [info.avatar] : []"
          @update:model-value="(files) => (info.avatar = files.length ? files[0] : null)"
        ></me-upload-user-file>
      </el-form-item>
      <el-form-item :label="t('邮箱')" prop="email">
        <el-input v-model="info.email"></el-input>
      </el-form-item>
      <el-form-item :label="t('手机号')" prop="mobile">
        <el-input v-model="info.mobile"></el-input>
      </el-form-item>
      <el-form-item :label="t('登录失败次数')" prop="loginFailure">
        <el-input-number v-model="info.loginFailure" :value-on-clear="null"></el-input-number>
      </el-form-item>
      <el-form-item :label="t('最后登录时间')" prop="lastLoginAt">
        <el-input v-model="info.lastLoginAt"></el-input>
      </el-form-item>
      <el-form-item :label="t('最后登录ip')" prop="lastLoginIp">
        <el-input v-model="info.lastLoginIp"></el-input>
      </el-form-item>
      <el-form-item :label="t('状态')" prop="status">
        <el-select v-model="info.status">
          <el-option v-for="val in dict.status" :key="val.value" :value="val.value" :label="val.label" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('创建者Id')" prop="createdUserId">
        <el-input v-model="info.createdUserId"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <me-button @click="() => (show = false)">{{ t('取消') }}</me-button>
      <me-button type="primary" @click="submit">{{ t('提交') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="AddOrUpUser">
import { User, addUserApi, updateUserApi, userInfoApi } from '@/api/user';
import { useLocalesI18n } from '@/locales/i18n';
import { resetObj } from '@/utils/helper';
import { isMobile } from '@/utils/validate.js';
import { FormInstance, FormRules } from 'element-plus';
import { getDict } from '../dict.js';
//接口需要现在setup顶层初始化（如果是异步setup需要在异步调用之前初始化），否则会有unMounted，非法调用警告，因为vueRequest使用了unMounted
const { runAsync: updateRunAsync } = updateUserApi();
const { runAsync: addRunAsync } = addUserApi();
const { runAsync: infoRunAsync } = userInfoApi();

let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'user']);
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

const info = reactive(new User());
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
  username: [
    { required: true, message: t('{label} 必须填写', { label: t('用户名') }), trigger: 'blur' },
    { type: 'string', min: 1, max: 50, message: t('{label} 长度必须在 {min} 及 {max} 之间', { label: t('用户名'), min: 1, max: 50 }), trigger: 'blur' },
  ],
  nickname: [
    { required: true, message: t('{label} 必须填写', { label: t('昵称') }), trigger: 'blur' },
    { type: 'string', min: 1, max: 20, message: t('{label} 长度必须在 {min} 及 {max} 之间', { label: t('昵称'), min: 1, max: 20 }), trigger: 'blur' },
  ],
  email: [
    { type: 'string', max: 100, message: t('{label} 长度必须小于等于 {max}', { label: t('邮箱'), max: 100 }), trigger: 'blur' },
    { type: 'email', message: t('{label} 必须是正确的邮箱格式', { label: t('邮箱') }), trigger: 'blur' },
  ],
  mobile: [{ validator: (rule, value: string | number) => (value ? isMobile(value) : true), message: t('{label} 必须是正确的手机号', { label: t('手机号') }), trigger: 'blur' }],
  status: [{ required: true, message: t('{label} 必须填写', { label: t('状态') }), trigger: 'blur' }],
};
const formEl = ref<FormInstance>();
const submit = async () => {
  try {
    await formEl.value!.validate();
  } catch (invalidFields) {
    return formEl.value!.scrollToField(Object.keys(invalidFields!)[0]);
  }
  if (props.id) {
    await updateRunAsync(props.id, info);
  } else {
    await addRunAsync(info);
  }
  show.value = false;
  emit('success');
};
</script>
