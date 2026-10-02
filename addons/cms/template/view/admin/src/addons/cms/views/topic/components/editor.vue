<template>
  <me-dialog v-model="show" :title="t(readonly ? '详情' : id ? '编辑' : '新增')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-form ref="formEl" :model="form" :rules="rules" :disabled="readonly || loading" label-position="top">
      <el-form-item :label="t('名称')" prop="title"><el-input v-model="form.title" /></el-form-item>
      <el-form-item :label="t('SEO 标识')" prop="slug"><el-input v-model="form.slug" /></el-form-item>
      <el-form-item :label="t('摘要')" prop="summary"><el-input v-model="form.summary" type="textarea" :rows="3" /></el-form-item>
      <el-form-item :label="t('Markdown 内容')" prop="mdContent"><el-input v-model="form.mdContent" type="textarea" :rows="14" maxlength="200000" /><cms-preview :content="form.mdContent" /></el-form-item>
      <el-form-item :label="t('封面')" prop="coverUrl">
        <!-- 图片统一由上传按钮产生，上传后可即时预览 -->
        <me-upload accept=".png,.jpg,.jpeg,.webp" :limit="1" list-type="picture" :model-value="uploadValue(form.coverUrl)" @update:model-value="(files) => (form.coverUrl = files[0]?.url ?? '')" />
        <el-alert class="cover-tip" title="建议上传 1200×800（3:2）图片，单张体积不超过 500MB" type="info" :closable="false" />
      </el-form-item>
      <el-form-item :label="t('状态')" prop="status"
        ><el-select v-model="form.status"><el-option :value="0" :label="t('禁用')" /><el-option :value="1" :label="t('启用')" /></el-select
      ></el-form-item>
      <el-form-item :label="t('排序')" prop="orderNum"><el-input-number :key="String(readonly || loading)" v-model="form.orderNum" :min="-9999" :max="9999" /></el-form-item>
    </el-form>
    <template #footer
      ><el-button @click="show = false">{{ t('取消') }}</el-button
      ><el-button v-if="!readonly" type="primary" :loading="saving" @click="save">{{ t('保存') }}</el-button></template
    >
  </me-dialog>
</template>
<script setup lang="ts">
import type { FileInfo } from '@/api/file';
import { useLocalesI18n } from '@/locales/i18n';
import type { FormInstance, FormRules } from 'element-plus';
import { reactive, ref, watch } from 'vue';
import { defaults, infoApi, saveApi } from '../../../api/topic';
import CmsPreview from '../../../components/cmsPreview.vue';

const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../../lang/${locale}.json`), 'cms']);
const props = defineProps<{ id?: string; readonly?: boolean }>();
const emit = defineEmits<{ success: []; closed: [] }>();
const show = defineModel<boolean>();
const form = reactive(defaults());
const formEl = ref<FormInstance>();
const { runAsync: getInfo, loading } = infoApi();
const { runAsync: saveInfo, loading: saving } = saveApi();

// 回显已保存的图片：把 URL 还原成上传组件需要的文件对象，保证编辑时可见预览
const uploadValue = (url: string): FileInfo[] => (url ? ([{ url, name: url.split('/').pop() ?? 'image' }] as FileInfo[]) : []);
const rules: FormRules = { title: [{ required: true, message: t('必填'), trigger: 'blur' }], slug: [{ required: true, message: t('必填'), trigger: 'blur' }] };
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
