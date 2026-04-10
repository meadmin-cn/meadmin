<template>
  <div class="user-info">
    <el-form ref="formRef" size="large" label-width="auto" :rules="rules" :model="userParams" @keyup.enter="submit">
      <el-form-item prop="username" class="upload-item">
        <me-up-avatar v-model="userParams.avatar"></me-up-avatar>
      </el-form-item>
      <el-form-item prop="nickname" label="昵称">
        <el-input v-model="userParams.nickname" autofocus placeholder="昵称" clearable />
      </el-form-item>
      <el-form-item prop="username" label="用户名">
        <el-input v-model="userParams.username" placeholder="用户名" clearable />
      </el-form-item>
      <el-form-item prop="email" label="邮箱">
        <el-input v-model="userParams.email" placeholder="邮箱" clearable />
      </el-form-item>
      <el-form-item prop="mobile" label="手机号">
        <el-input v-model="userParams.mobile" placeholder="手机号" clearable />
      </el-form-item>
      <me-button @click="resetForm(formRef)">重置</me-button>
      <me-button type="primary" class="button submit" @click="submit">确定</me-button>
    </el-form>
  </div>
</template>

<script setup lang="ts" name="UserInfo">
import type { UpdateUserInfoParam} from '@/api/user.js';
import { updateUserApi, userInfoApi } from '@/api/user.js';
import type { FormInstance, FormRules } from 'element-plus';

const userInfo = await userInfoApi().runAsync();
const userParams = reactive(userInfo);
const rules: FormRules<UpdateUserInfoParam> = {
  nickname: [
    {
      required: true,
      message: '请填写昵称',
      trigger: 'blur',
    },
    {
      min: 3,
      max: 8,
      message: '长度必须在 3 到 8个字符之间',
      trigger: 'blur',
    },
  ],
  username: [
    {
      required: true,
      message: '请填写用户名',
      trigger: 'blur',
    },
    {
      min: 3,
      max: 8,
      message: '长度必须在 3 到 8个字符之间',
      trigger: 'blur',
    },
  ],
  email: [
    {
      type: 'email',
      message: '请输入正确的邮箱格式',
      trigger: ['blur'],
    },
  ],
  mobile: [
    {
      pattern: /^1[0-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: ['blur'],
    },
  ],
};
const formRef = ref<FormInstance>();
const submit = async () => {
  formRef.value?.validate(async (valid, fields) => {
    if (valid) {
      await updateUserApi().runAsync(userParams);
    } else {
      console.log('提交错误', fields);
    }
  });
};
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};
</script>
<style lang="scss" scoped>
.user-info {
}
</style>
