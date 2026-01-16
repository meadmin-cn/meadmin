<template>
  <div class="edit-pass">
    <el-form ref="formRef" size="large" label-width="auto" :rules="rules" :model="editPassParams" @keyup.enter="submit">
      <el-form-item prop="orgPassword" label="原始密码">
        <el-input type="password" v-model="editPassParams.orgPassword" placeholder="原始密码" clearable show-password />
      </el-form-item>
      <el-form-item prop="password" label="新密码">
        <el-input type="password" v-model="editPassParams.password" placeholder="新密码" clearable show-password />
      </el-form-item>
      <el-form-item prop="reqPassword" label="确认密码">
        <el-input type="password" v-model="editPassParams.reqPassword" placeholder="请重复输入新密码" clearable show-password />
      </el-form-item>
      <me-button @click="resetForm(formRef)">重置</me-button>
      <me-button type="primary" class="button submit" @click="submit">确定</me-button>
    </el-form>
  </div>
</template>

<script setup lang="ts" name="EditPass">
import { updateUserApi } from '@/api/user.js';
import { FormInstance, FormRules } from 'element-plus';
const editPassParams = reactive({
  orgPassword: '',
  password: '',
  reqPassword: '',
});
const rules: FormRules<typeof editPassParams> = {
  orgPassword: [
    {
      required: true,
      message: '请填写原始密码',
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      message: '请填写密码',
      trigger: 'blur',
    },
    {
      min: 6,
      max: 20,
      message: '长度必须在 6 到 20个字符之间',
      trigger: 'blur',
    },
  ],
  reqPassword: [
    {
      required: true,
      message: '确认密码',
      trigger: 'blur',
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error('请输入确认密码'));
        } else if (value !== editPassParams.password) {
          callback(new Error('两次密码不一致'));
        } else {
          callback();
        }
      },
    },
  ],
};
const formRef = ref<FormInstance>();
const submit = async () => {
  formRef.value?.validate(async (valid, fields) => {
    if (valid) {
      await updateUserApi().runAsync(editPassParams);
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
.edit-pass {
}
</style>
