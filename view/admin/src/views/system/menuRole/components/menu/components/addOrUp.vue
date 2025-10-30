<template>
  <me-dialog v-model="show" :title="t(id ? '编辑' : '新增')" :close-on-click-modal="false" @closed="$emit('closed')">
    <el-form v-loading="loading" ref="formEl" :model="info" :rules="rules" class="add" label-width="auto">
      <el-form-item :label="t('父级')" prop="parentId">
        <el-tree-select v-model="info.parentId" :data="treeAllList || []" check-strictly node-key="id" :props="{label:'title'}" :render-after-expand="false" clearable filterable/>
      </el-form-item>
      <el-form-item :label="t('菜单名称')" prop="title">
        <el-input v-model="info.title"></el-input>
      </el-form-item>
      <el-form-item :label="t('类型')" prop="menuType">
        <el-select v-model="info.menuType">
          <el-option v-for="val in dict.menuType" :key="val.value" :value="val.value" :label="val.label" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('状态')" prop="status">
        <el-select v-model="info.status" :value-on-clear="null" clearable>
          <el-option v-for="val in dict.status" :key="val.value" :value="val.value" :label="val.label" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('权限')" prop="rule">
        <el-input v-model="info.rule"></el-input>
      </el-form-item>
      <el-form-item :label="t('排序(降序)')" prop="orderNum">
        <el-input-number v-model="info.orderNum" :value-on-clear="null"></el-input-number>
      </el-form-item>
      <el-form-item :label="t('路径')" prop="path">
        <el-input v-model="info.path"></el-input>
      </el-form-item>
      <el-form-item :label="t('外链')" prop="isLink">
        <el-select v-model="info.isLink" :value-on-clear="null">
          <el-option v-for="val in dict.isLink" :key="val.value" :value="val.value" :label="val.label" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('组件路径(相对于views文件夹)')" prop="component">
        <el-input v-model="info.component"></el-input>
      </el-form-item>
      <el-form-item :label="t('隐藏')" prop="hideMenu">
        <el-select v-model="info.hideMenu" :value-on-clear="null">
          <el-option v-for="val in dict.hideMenu" :key="val.value" :value="val.value" :label="val.label" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('缓存')" prop="cache">
        <el-select v-model="info.cache" :value-on-clear="null">
          <el-option v-for="val in dict.cache" :key="val.value" :value="val.value" :label="val.label" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('图标')" prop="icon">
        <el-input v-model="info.icon"></el-input>
      </el-form-item>
      <el-form-item :label="t('固定tag')" prop="affix">
        <el-select v-model="info.affix" :value-on-clear="null" >
          <el-option v-for="val in dict.affix" :key="val.value" :value="val.value" :label="val.label" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('恒定展示(只有一个子元素时不隐藏)')" prop="alwaysShow">
        <el-select v-model="info.alwaysShow" :value-on-clear="null" >
          <el-option v-for="val in dict.alwaysShow" :key="val.value" :value="val.value" :label="val.label" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('面包屑')" prop="breadcrumb">
        <el-select v-model="info.breadcrumb" :value-on-clear="null">
          <el-option v-for="val in dict.breadcrumb" :key="val.value" :value="val.value" :label="val.label" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <me-button @click="() => (show = false)">{{ t('取消') }}</me-button>
      <me-button type="primary" @click="submit">{{ t('提交') }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="AddOrUpSystemMenu">
import { SystemMenu, SystemMenuInfo, addSystemMenuApi, updateSystemMenuApi, systemMenuInfoApi, systemMenuTreeAllApi } from '@/api/system/menu';
import { useLocalesI18n } from '@/locales/i18n';
import { resetObj, formatterStr } from '@/utils/helper';
import { FormInstance, FormRules } from 'element-plus';
import { VxeColumnPropTypes } from 'vxe-table';
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'systemMenu']);
await loadRes;
const dict = {
  menuType: [
    { value: 1, label: t('目录') },
    { value: 2, label: t('菜单') },
    { value: 3, label: t('按钮') },
  ],
  status: [
    { value: 1, label: t('启用') },
    { value: 0, label: t('禁用') },
  ],
  isLink: [
    { value: 1, label: t('是') },
    { value: 0, label: t('否') },
  ],
  hideMenu: [
    { value: 1, label: t('是') },
    { value: 0, label: t('否') },
  ],
  cache: [
    { value: 1, label: t('是') },
    { value: 0, label: t('否') },
  ],
  affix: [
    { value: 1, label: t('是') },
    { value: 0, label: t('否') },
  ],
  alwaysShow: [
    { value: 1, label: t('是') },
    { value: 0, label: t('否') },
  ],
  breadcrumb: [
    { value: 1, label: t('展示') },
    { value: 0, label: t('不展示') },
  ],
};
const { data:treeAllList,runAsync:getTreeAllAsync } = systemMenuTreeAllApi();
getTreeAllAsync();
const formatterDict: VxeColumnPropTypes.Formatter<SystemMenuInfo> = ({ cellValue, column }) => {
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
const info = reactive(new SystemMenu());
const loading = ref(false);
watch(
  () => props.id,
  async (id?: string) => {
    if (id) {
      loading.value = true;
      resetObj(info, await systemMenuInfoApi({ noLoading: true }).runAsync(id));
      loading.value = false;
    }
  },
  { immediate: true },
);
const rules: FormRules = {
  parentId: [{ type: 'string', max: 100, message: t('{label} 长度必须小于等于 {max}', { label: t('父级id'), max: 100 }), trigger: 'blur' }],
  title: [
    { required: true, message: t('{label} 必须填写', { label: t('菜单名称') }), trigger: 'blur' },
    { type: 'string', max: 100, message: t('{label} 长度必须小于等于 {max}', { label: t('菜单名称'), max: 100 }), trigger: 'blur' },
  ],
  menuType: [{ required: true, message: t('{label} 必须填写', { label: t('类型') }), trigger: 'blur' }],
  rule: [
    { required: true, message: t('{label} 必须填写', { label: t('权限') }), trigger: 'blur' },
    { type: 'string', max: 100, message: t('{label} 长度必须小于等于 {max}', { label: t('权限'), max: 100 }), trigger: 'blur' },
  ],
  orderNum: [{ type: 'number', max: 9999, message: t('{label} 必须小于等于 {max}', { label: t('排序(降序)'), max: 9999 }), trigger: 'blur' }],
  path: [{ type: 'string', max: 500, message: t('{label} 长度必须小于等于 {max}', { label: t('路径'), max: 500 }), trigger: 'blur' }],
  component: [{ type: 'string', max: 500, message: t('{label} 长度必须小于等于 {max}', { label: t('组件路径(相对于views文件夹)'), max: 500 }), trigger: 'blur' }],
  icon: [{ type: 'string', max: 50, message: t('{label} 长度必须小于等于 {max}', { label: t('图标'), max: 50 }), trigger: 'blur' }],
};
const formEl = ref<FormInstance>();
const submit = async () => {
  try {
    await formEl.value!.validate();
  } catch (invalidFields) {
    return formEl.value!.scrollToField(Object.keys(invalidFields!)[0]);
  }
  if (props.id) {
    await updateSystemMenuApi().runAsync(props.id, info);
  } else {
    await addSystemMenuApi().runAsync(info);
  }
  show.value = false;
  emit('success');
};
</script>
<style lang="scss" scoped>
.add{
  :deep(.el-form-item__label){
    max-width: 130px;
  }
}
</style>