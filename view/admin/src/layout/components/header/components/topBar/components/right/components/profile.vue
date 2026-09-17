<template>
  <me-dialog v-model="show" :title="t('个人中心')" width="620px" :close-on-click-modal="false">
    <el-form ref="formRef" v-loading="loading" :model="form" :rules="rules" label-width="auto" class="profile-form">
      <div class="profile-grid">
        <el-form-item :label="t('头像')" class="avatar-item">
          <me-upload list-type="picture" :limit="1" :model-value="form.avatar ? [form.avatar] : []" @update:model-value="(files) => (form.avatar = files.length ? files[0] : null)" />
        </el-form-item>
        <el-form-item :label="t('用户名')">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        <el-form-item :label="t('昵称')" prop="nickname">
          <el-input v-model="form.nickname" clearable />
        </el-form-item>
        <el-form-item :label="t('状态')">
          <el-input :model-value="form.status === 1 ? t('启用') : t('禁用')" disabled />
        </el-form-item>
        <el-form-item :label="t('手机号')" prop="mobile">
          <el-input v-model="form.mobile" clearable />
        </el-form-item>
        <el-form-item :label="t('邮箱')" prop="email">
          <el-input v-model="form.email" clearable />
        </el-form-item>
        <el-form-item :label="t('组织')">
          <el-input :model-value="organizations" disabled />
        </el-form-item>
        <el-form-item :label="t('角色')">
          <el-input :model-value="roles" disabled />
        </el-form-item>
      </div>
      <el-divider content-position="left">{{ t('修改密码（不修改请留空）') }}</el-divider>
      <div class="password-grid">
        <el-form-item :label="t('原密码')" prop="oldPassword">
          <el-input v-model="form.oldPassword" type="password" show-password clearable />
        </el-form-item>
        <el-form-item :label="t('新密码')" prop="newPassword">
          <el-input v-model="form.newPassword" type="password" show-password clearable />
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <me-button :disabled="loading || saving" @click="show = false">{{ t('取消') }}</me-button>
      <me-button type="primary" :loading="saving" :disabled="loading || saving" @click="submit">{{ t('确定') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="AdminProfile">
import type { FileInfo } from '@/api/file.js';
import { adminProfileInfoApi, updateAdminProfileApi } from '@/api/profile.js';
import { useGlobalStore, useUserStore } from '@/store';
import { isMobile } from '@/utils/validate.js';
import type { FormInstance, FormRules } from 'element-plus';
const { t } = useGlobalStore().i18n;
const show = defineModel<boolean>();
const userStore = useUserStore();
const { runAsync: loadProfile, loading } = adminProfileInfoApi();
const { runAsync: saveProfile } = updateAdminProfileApi();
const formRef = ref<FormInstance>();
const saving = ref(false);
const form = reactive({
  username: '',
  nickname: '',
  status: 1 as number,
  mobile: '',
  email: '',
  avatar: null as FileInfo | null,
  oldPassword: '',
  newPassword: '',
});
const roleNames = ref('');
const organizationNames = ref('');
const roles = computed(() => roleNames.value || t('暂无'));
const organizations = computed(() => organizationNames.value || t('暂无'));
const rules = computed<FormRules>(() => ({
  nickname: [
    { required: true, whitespace: true, message: t('请输入昵称'), trigger: 'blur' },
    { max: 20, message: t('昵称不能超过20个字符'), trigger: 'blur' },
  ],
  mobile: [
    {
      required: true,
      validator: (_r, v, cb) => (isMobile(v) ? cb() : cb(new Error(t('请输入正确的手机号')))),
      trigger: 'blur',
    },
  ],
  email: [{ type: 'email', message: t('请输入正确的邮箱'), trigger: 'blur' }],
  newPassword: [{ min: 6, max: 20, message: t('密码长度为 6-20 位'), trigger: 'blur' }],
  oldPassword: [
    {
      validator: (_r, v, cb) => (form.newPassword && !v ? cb(new Error(t('修改密码请输入原密码'))) : cb()),
      trigger: 'blur',
    },
  ],
}));

watch(
  show,
  async (value) => {
    if (!value) return;
    const info = await loadProfile();
    Object.assign(form, {
      username: info.username,
      nickname: info.nickname,
      status: info.status,
      mobile: info.mobile,
      email: info.email,
      avatar: info.avatar,
      oldPassword: '',
      newPassword: '',
    });
    roleNames.value = info.roles?.map((item) => item.roleName).join('、') || '';
    organizationNames.value = info.organizations?.map((item) => item.orgName).join('、') || '';
  },
  { immediate: true },
);

const submit = async () => {
  if (loading.value || saving.value || !formRef.value) return;
  saving.value = true;
  try {
    try {
      await formRef.value.validate();
    } catch {
      return;
    }
    const updated = await saveProfile({
      nickname: form.nickname,
      email: form.email,
      mobile: form.mobile,
      avatar: form.avatar,
      oldPassword: form.oldPassword || undefined,
      newPassword: form.newPassword || undefined,
    });
    Object.assign(userStore.user, {
      nickname: updated.nickname,
      email: updated.email,
      mobile: updated.mobile,
      avatar: updated.avatar,
    });
    show.value = false;
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped lang="scss">
.profile-grid,
.password-grid {
  display: grid;
  gap: 0 18px;
}

.profile-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.password-grid {
  grid-template-columns: minmax(0, 1fr);
}

.avatar-item {
  grid-column: 1 / -1;
}

.profile-form :deep(.el-input__wrapper) {
  min-height: 36px;
}

@media (max-width: 600px) {
  .profile-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
