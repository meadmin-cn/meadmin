<template>
  <me-dialog v-model="show" :title="t(id ? '编辑' : '新增')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-form v-loading="loading" ref="formEl" :model="info" :rules="rules" class="add" label-width="auto">
      <el-form-item :label="t('角色组')" prop="roleIds">
        <el-tree-select v-model="info.roleIds" :data="treeAllList || []" check-strictly node-key="id" multiple filterable :props="{ label: 'roleName' }" :render-after-expand="false" />
      </el-form-item>
      <el-form-item :label="t('用户名')" prop="username">
        <el-input v-model="info.username" clearable></el-input>
      </el-form-item>
      <el-form-item :label="t('昵称')" prop="nickname">
        <el-input v-model="info.nickname" clearable></el-input>
      </el-form-item>
      <el-form-item :label="t('密码')" prop="password">
        <el-input v-model="info.password" clearable></el-input>
      </el-form-item>
      <el-form-item :label="t('头像')" prop="avatar">
        <me-upload list-type="picture" :limit="1" :model-value="info.avatar?[info.avatar]:[]" @update:modelValue="(files)=>info.avatar =files.length? files[0]:null" ></me-upload>
      </el-form-item>
      <el-form-item :label="t('邮箱')" prop="email">
        <el-input v-model="info.email" clearable></el-input>
      </el-form-item>
      <el-form-item :label="t('手机号')" prop="mobile">
        <el-input v-model="info.mobile" clearable></el-input>
      </el-form-item>
      <el-form-item :label="t('状态')" prop="status">
        <el-select v-model="info.status">
          <el-option v-for="val in dict.status" :key="val.value" :value="val.value" :label="val.label" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <me-button @click="() => (show = false)">{{ t('取消') }}</me-button>
      <me-button type="primary" @click="submit">{{ t('提交') }}</me-button>
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
import { systemRoleTreeAllApi } from '@/api/system/role';
import { getDict } from '../dict.js';
const { data: treeAllList, runAsync: getTreeAllAsync } = systemRoleTreeAllApi();
getTreeAllAsync();
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'systemAdmin']);
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
const info = reactive(new SystemAdmin());
const loading = ref(false);
watch(
  () => props.id,
  async (id?: string) => {
    if (id) {
      loading.value = true;
      const enitity = await systemAdminInfoApi({ noLoading: true }).runAsync(id);
      resetObj(info, Object.assign({ roleIds: enitity.roles.map((item) => item.id) }, enitity));
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
  mobile: [
    { required: true, message: t('{label} 必须填写', { label: t('手机号') }), trigger: 'blur' },

    { validator: (rule, value: string | number) => isMobile(value), message: t('{label} 必须是正确的手机号', { label: t('手机号') }), trigger: 'blur' },
  ],
  status: [{ required: true, message: t('{label} 必须选择', { label: t('状态') }), trigger: 'blur' }],
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
