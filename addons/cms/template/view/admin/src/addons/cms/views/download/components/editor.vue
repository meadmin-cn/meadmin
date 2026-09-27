<template>
  <me-dialog v-model="show" :title="t(readonly ? '详情' : id ? '编辑下载资源' : '新增下载资源')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-form ref="formEl" :model="form" :rules="rules" :disabled="readonly || loading" label-position="top">
      <el-row :gutter="16"><el-col :span="16"><el-form-item label="标题" prop="title"><el-input v-model="form.title" /></el-form-item></el-col><el-col :span="8"><el-form-item label="版本" prop="version"><el-input v-model="form.version" /></el-form-item></el-col></el-row>
      <el-row :gutter="16"><el-col :span="12"><el-form-item label="SEO 标识" prop="slug"><el-input v-model="form.slug" /></el-form-item></el-col><el-col :span="12"><el-form-item label="下载栏目" prop="category"><el-input v-model="form.category" /></el-form-item></el-col></el-row>
      <el-form-item label="资源简介" prop="summary"><el-input v-model="form.summary" type="textarea" :rows="3" /></el-form-item>
      <el-form-item label="资源详情" prop="mdContent"><me-wang-editor v-model="form.mdContent" :config="editorConfig" /></el-form-item>
      <el-row :gutter="16"><el-col :span="12"><el-form-item label="封面地址" prop="coverUrl"><el-input v-model="form.coverUrl" /></el-form-item></el-col><el-col :span="12"><el-form-item label="文件地址" prop="fileUrl"><el-input v-model="form.fileUrl" /></el-form-item></el-col></el-row>
      <el-row :gutter="16"><el-col :span="12"><el-form-item label="状态" prop="status"><el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="展示" inactive-text="隐藏" /></el-form-item></el-col><el-col :span="12"><el-form-item label="排序" prop="orderNum"><el-input-number v-model="form.orderNum" :min="-9999" :max="9999" /></el-form-item></el-col></el-row>
    </el-form>
    <template #footer><el-button @click="show = false">取消</el-button><el-button v-if="!readonly" type="primary" :loading="saving" @click="save">保存</el-button></template>
  </me-dialog>
</template>
<script setup lang="ts">
import { useLocalesI18n } from '@/locales/i18n';
import type { FormInstance, FormRules } from 'element-plus';
import { reactive, ref, watch } from 'vue';
import MeWangEditor from '@/components/meWangEditor/index.vue';
import { defaults, infoApi, saveApi } from '../../../api/download';
const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../../lang/${locale}.json`), 'cms']);
const props = defineProps<{ id?: string; readonly?: boolean }>();
const emit = defineEmits<{ success: []; closed: [] }>();
const show = defineModel<boolean>();
const form = reactive(defaults());
const formEl = ref<FormInstance>();
const editorConfig = { editor: { placeholder: '请输入下载资源详情...' } };
const { runAsync: getInfo, loading } = infoApi();
const { runAsync: saveInfo, loading: saving } = saveApi();
const rules: FormRules = { title: [{ required: true, message: t('必填'), trigger: 'blur' }], slug: [{ required: true, message: t('必填'), trigger: 'blur' }], fileUrl: [{ required: true, message: t('必填'), trigger: 'blur' }] };
const save = async () => { if (!(await formEl.value?.validate().catch(() => false))) return; await saveInfo(props.id, form); show.value = false; emit('success'); };
await loadRes;
watch(() => props.id, async (id) => { Object.assign(form, defaults()); if (id) Object.assign(form, await getInfo(id)); }, { immediate: true });
</script>
