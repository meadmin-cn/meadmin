<template>
  <me-dialog v-model="show" :title="t(readonly ? '详情' : id ? '编辑' : '新增')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-form ref="formEl" :model="form" :rules="rules" :disabled="readonly || loading" label-position="top">
      <el-form-item :label="t('名称')" prop="title"><el-input v-model="form.title" /></el-form-item>
      <el-form-item :label="t('SEO 标识')" prop="slug"><el-input v-model="form.slug" /></el-form-item>
      <el-form-item :label="t('展示位置')" prop="position"><el-input v-model="form.position" /></el-form-item>
      <el-form-item :label="t('类型')" prop="kind"
        ><el-select v-model="form.kind"><el-option :value="1" :label="t('区块')" /><el-option :value="2" :label="t('轮播')" /><el-option :value="3" :label="t('广告')" /></el-select
      ></el-form-item>
      <el-form-item :label="t('Markdown 内容')" prop="mdContent"><el-input v-model="form.mdContent" type="textarea" :rows="14" maxlength="200000" /><cms-preview :content="form.mdContent" /></el-form-item>
      <el-form-item :label="t('封面')" prop="coverUrl"><el-input v-model="form.coverUrl" maxlength="1000" /><me-upload accept=".png,.jpg,.jpeg,.webp" :limit="1" list-type="picture" @update:model-value="(files) => (form.coverUrl = files[0]?.url ?? '')" /></el-form-item>
      <el-form-item :label="t('链接')" prop="link"><el-input v-model="form.link" /></el-form-item>
      <el-form-item :label="t('状态')" prop="status"
        ><el-select v-model="form.status"><el-option :value="0" :label="t('禁用')" /><el-option :value="1" :label="t('启用')" /></el-select
      ></el-form-item>
      <el-form-item :label="t('开始时间')" prop="startAt"><el-date-picker v-model="form.startAt" type="datetime" value-format="YYYY-MM-DDTHH:mm:ssZ" clearable /></el-form-item>
      <el-form-item :label="t('结束时间')" prop="endAt"><el-date-picker v-model="form.endAt" type="datetime" value-format="YYYY-MM-DDTHH:mm:ssZ" clearable /></el-form-item>
      <el-form-item :label="t('排序')" prop="orderNum"><el-input-number :key="String(readonly || loading)" v-model="form.orderNum" :min="-9999" :max="9999" /></el-form-item>
    </el-form>
    <template #footer
      ><el-button @click="show = false">{{ t('取消') }}</el-button
      ><el-button v-if="!readonly" type="primary" :loading="saving" @click="save">{{ t('保存') }}</el-button></template
    >
  </me-dialog>
</template>
<script setup lang="ts">
import { useLocalesI18n } from '@/locales/i18n';
import type { FormInstance, FormRules } from 'element-plus';
import { reactive, ref, watch } from 'vue';
import { defaults, infoApi, saveApi } from '../../../api/block';
import CmsPreview from '../../../components/cmsPreview.vue';

const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../../lang/${locale}.json`), 'cms']);
const props = defineProps<{ id?: string; readonly?: boolean }>();
const emit = defineEmits<{ success: []; closed: [] }>();
const show = defineModel<boolean>();
const form = reactive(defaults());
const formEl = ref<FormInstance>();
const { runAsync: getInfo, loading } = infoApi();
const { runAsync: saveInfo, loading: saving } = saveApi();

const rules: FormRules = { title: [{ required: true, message: t('必填'), trigger: 'blur' }], slug: [{ required: true, message: t('必填'), trigger: 'blur' }], position: [{ required: true, message: t('必填'), trigger: 'blur' }] };
const save = async () => {
  if (!(await formEl.value?.validate().catch(() => false))) return;
  await saveInfo(props.id, form);
  show.value = false;
  emit('success');
};
await loadRes;
watch(
  () => props.id,
  async (id) => {
    Object.assign(form, defaults());
    if (id) {
      const data = await getInfo(id);
      for (const key of Object.keys(form) as Array<keyof typeof form>) Object.assign(form, { [key]: data[key] });
    }
  },
  { immediate: true },
);
</script>
