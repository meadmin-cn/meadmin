<template>
  <me-dialog v-loading="loading" v-model="show" :title="t(info.id ? '编辑' : '新增')" :close-on-click-modal="false" @closed="$emit('closed')">
    <el-form ref="formEl" :model="info" :rules="rules" class="add" label-width="auto">
      <el-form-item :label="t('ID')" prop="id">
        <el-input v-model="info.id"></el-input>
      </el-form-item>
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
        <el-input v-model="info.avatar"></el-input>
      </el-form-item>
      <el-form-item :label="t('邮箱')" prop="email">
        <el-input v-model="info.email"></el-input>
      </el-form-item>
      <el-form-item :label="t('手机号')" prop="mobile">
        <el-input v-model="info.mobile"></el-input>
      </el-form-item>
      <el-form-item :label="t('登录失败次数')" prop="loginFailure">
        <el-input-number v-model="info.loginFailure"></el-input-number>
      </el-form-item>
      <el-form-item :label="t('最后登录时间')" prop="lastLoginAt">
        <el-input v-model="info.lastLoginAt"></el-input>
      </el-form-item>
      <el-form-item :label="t('最后登录ip')" prop="lastLoginIp">
        <el-input v-model="info.lastLoginIp"></el-input>
      </el-form-item>
      <el-form-item :label="t('状态')" prop="status">
        <el-select v-model="info.status">
          <el-option v-for="val in dict.status" :key="val.value" :value="val.value">{{ val.label }}</el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="t('超级管理员')" prop="isSuper">
        <el-select v-model="info.isSuper">
          <el-option v-for="val in dict.isSuper" :key="val.value" :value="val.value">{{ val.label }}</el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="t('创建时间')" prop="createdAt">
        <el-input v-model="info.createdAt"></el-input>
      </el-form-item>
      <el-form-item :label="t('最后更新时间')" prop="updatedAt">
        <el-input v-model="info.updatedAt"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <me-button type="primary" @click="submit">{{ t('提交') }}</me-button>
      <me-button @click="() => (show = false)">{{ t('取消') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="AddOrUpSystemAdmin">
import { SystemAdmin, SystemAdminInfo, addSystemAdminApi, updateSystemAdminApi, systemAdminInfoApi } from '@/api/system/admin';
import { useLocalesI18n } from '@/locales/i18n';
import { resetObj, formatterStr } from '@/utils/helper';
import { FormInstance, FormRules } from 'element-plus';
import { isMobile } from '@/utils/validate.js';
import { VxeColumnPropTypes } from 'vxe-table';
const dict = {
  status: {
    '0': { value: 0, label: '禁用' },
    '1': { value: 1, label: '启用' },
  },
  isSuper: {
    '0': { value: 0, label: '不是' },
    '1': { value: 1, label: '是' },
  },
};
const formatterDict: VxeColumnPropTypes.Formatter<SystemAdminInfo> = ({ cellValue, column }) => {
  //因为ts类型判定不得不断言dict
  return formatterStr({ cellValue: (dict as Record<string, any>)[column.field]?.[cellValue as string]?.label });
};
let { t } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'systemAdmin']);
const show = defineModel<boolean>();
const props = defineProps<{
  id?: string;
}>();
const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'closed'): void;
}>();
const info = reactive(new SystemAdmin());
const loading = ref(false);
watch(
  () => props.id,
  async (id?: string) => {
    if (id) {
      loading.value = true;
      resetObj(info, await systemAdminInfoApi().runAsync(id));
      loading.value = false;
    }
  },
  { immediate: true },
);
const rules: FormRules = {
  username: [
    { required: true, message: t('{label} 必须填写') + { label: t('用户名') }, trigger: 'blur' },
    { type: 'string', min: 1, max: 50, message: t('{label} 长度必须在 {min} 及 {max} 之间', { label: t('用户名'), min: 1, max: 50 }), trigger: 'blur' },
  ],
  nickname: [
    { required: true, message: t('{label} 必须填写') + { label: t('昵称') }, trigger: 'blur' },
    { type: 'string', min: 1, max: 20, message: t('{label} 长度必须在 {min} 及 {max} 之间', { label: t('昵称'), min: 1, max: 20 }), trigger: 'blur' },
  ],
  avatar: [{ type: 'string', min: 1, max: 100, message: t('{label} 长度必须在 {min} 及 {max} 之间', { label: t('头像'), min: 1, max: 100 }), trigger: 'blur' }],
  email: [
    { type: 'string', max: 100, message: t('{label} 长度必须小于等于 {max}', { label: t('邮箱'), max: 100 }), trigger: 'blur' },

    { type: 'email', message: t('{label} 必须是正确的邮箱格式', { label: t('邮箱') }), trigger: 'blur' },
  ],
  mobile: [
    { required: true, message: t('{label} 必须填写') + { label: t('手机号') }, trigger: 'blur' },

    { validator: (rule, value: string | number) => isMobile(value), message: t('{label} 必须是正确的手机号', { label: t('手机号') }), trigger: 'blur' },
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
    await updateSystemAdminApi().runAsync(props.id, info);
  } else {
    await addSystemAdminApi().runAsync(info);
  }
  show.value = false;
  emit('success');
};
</script>
