<template>
  <me-dialog v-model="show" :title="t(id ? '编辑' : '新增')" :close-on-click-modal="false" @closed="$emit('closed')">
    <el-form v-loading="loading" ref="formEl" :model="info" :rules="rules" class="add" label-width="auto">
      <el-form-item :label="t('父级')" prop="parentId">
        <el-tree-select v-model="info.parentId" :data="treeAllList || []" check-strictly node-key="id" :props="{label:'roleName'}" :render-after-expand="false"/>
      </el-form-item>
      <el-form-item :label="t('角色名称')" prop="roleName">
        <el-input v-model="info.roleName"></el-input>
      </el-form-item>
      <el-form-item :label="t('角色标识')" prop="roleKey">
        <el-input v-model="info.roleKey"></el-input>
      </el-form-item>
      <el-form-item :label="t('排序(降序)')" prop="orderNum">
        <el-input-number v-model="info.orderNum" :value-on-clear="null"></el-input-number>
      </el-form-item>
      <el-form-item :label="t('状态')" prop="status">
        <el-select v-model="info.status" :value-on-clear="null">
          <el-option v-for="val in dict.status" :key="val.value" :value="val.value" :label="val.label" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('备注')" prop="remark">
        <el-input v-model="info.remark"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <me-button @click="() => (show = false)">{{ t('取消') }}</me-button>
      <me-button type="primary" @click="submit">{{ t('提交') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="AddOrUpSystemRole">
import { SystemRole, SystemRoleInfo, addSystemRoleApi, updateSystemRoleApi, systemRoleInfoApi, systemRoleTreeAllApi } from '@/api/system/role';
import { useLocalesI18n } from '@/locales/i18n';
import { resetObj, formatterStr } from '@/utils/helper';
import { FormInstance, FormRules } from 'element-plus';
import { VxeColumnPropTypes } from 'vxe-table';
let { t } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'systemRole']);
const dict = {
  status: [
    { value: 1, label: t('启用') },
    { value: 0, label: t('禁用') },
  ],
};
const formatterDict: VxeColumnPropTypes.Formatter<SystemRoleInfo> = ({ cellValue, column }) => {
  //因为ts类型判定不得不断言dict
  return formatterStr({ cellValue: (dict as Record<string, { value: string | number; label: string }[]>)[column.field]?.find((item) => item.value == cellValue)?.label });
};
const show = defineModel<boolean>();
const props = defineProps<{
  id?: string;
}>();
const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'closed'): void;
}>();
const { data:treeAllList,runAsync:getTreeAllAsync } = systemRoleTreeAllApi();
getTreeAllAsync();
const info = reactive(new SystemRole());
const loading = ref(false);
watch(
  () => props.id,
  async (id?: string) => {
    if (id) {
      loading.value = true;
      resetObj(info, await systemRoleInfoApi({ noLoading: true }).runAsync(id));
      loading.value = false;
    }
  },
  { immediate: true },
);
const rules: FormRules = {
  parentId: [{ type: 'string', max: 100, message: t('{label} 长度必须小于等于 {max}', { label: t('父级id'), max: 100 }), trigger: 'blur' }],
  roleName: [
    { required: true, message: t('{label} 必须填写', { label: t('角色名称') }), trigger: 'blur' },
    { type: 'string', min: 1, max: 50, message: t('{label} 长度必须在 {min} 及 {max} 之间', { label: t('角色名称'), min: 1, max: 50 }), trigger: 'blur' },
  ],
  roleKey: [
    { required: true, message: t('{label} 必须填写', { label: t('角色标识') }), trigger: 'blur' },
    { type: 'string', min: 1, max: 50, message: t('{label} 长度必须在 {min} 及 {max} 之间', { label: t('角色标识'), min: 1, max: 50 }), trigger: 'blur' },
  ],
  orderNum: [{ type: 'number', max: 9999, message: t('{label} 必须小于等于 {max}', { label: t('排序(降序)'), max: 9999 }), trigger: 'blur' }],
  remark: [{ type: 'string', min: 1, max: 100, message: t('{label} 长度必须在 {min} 及 {max} 之间', { label: t('备注'), min: 1, max: 100 }), trigger: 'blur' }],
};
const formEl = ref<FormInstance>();
const submit = async () => {
  try {
    await formEl.value!.validate();
  } catch (invalidFields) {
    return formEl.value!.scrollToField(Object.keys(invalidFields!)[0]);
  }
  if (props.id) {
    await updateSystemRoleApi().runAsync(props.id, info);
  } else {
    await addSystemRoleApi().runAsync(info);
  }
  emit('success');
  show.value = false;
};
</script>
