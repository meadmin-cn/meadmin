<template>
  <me-dialog v-model="show" :title="t(readonly ? '详情' : id ? '编辑' : '新增')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-alert :title="t('评论仅由后台管理员录入')" type="info" :closable="false" />
    <el-alert v-if="error" :title="error" type="error" :closable="false" class="editor-alert" />
    <el-form ref="formEl" :model="form" :rules="rules" :disabled="readonly || loading" label-position="top">
      <el-form-item :label="t('文章')" prop="articleId"
        ><el-input v-model="form.articleId" />
        <div v-if="detail?.articleTitle" class="editor-article">所属文章：{{ detail.articleTitle }}</div></el-form-item
      >
      <el-form-item :label="t('显示名称')" prop="author"><el-input v-model="form.author" /></el-form-item>
      <el-form-item :label="t('评论内容')" prop="content"><el-input v-model="form.content" type="textarea" :rows="3" /></el-form-item>
    </el-form>
    <el-descriptions v-if="readonly && detail" :column="1" border size="small" class="editor-desc">
      <el-descriptions-item label="状态"
        ><el-tag size="small" :type="(['warning', 'success', 'danger'] as const)[detail.status] ?? 'info'">{{ t(states[detail.status] ?? '') }}</el-tag></el-descriptions-item
      >
      <el-descriptions-item label="举报次数"
        ><el-tag v-if="detail.reportCount" size="small" type="danger">{{ detail.reportCount }}</el-tag
        ><span v-else>0</span></el-descriptions-item
      >
      <el-descriptions-item label="举报说明">{{ detail.reportReason || '—' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ formatterAtExec(detail.createdAt) }}</el-descriptions-item>
    </el-descriptions>
    <template #footer
      ><el-button @click="show = false">{{ t('取消') }}</el-button
      ><el-button v-if="!readonly" type="primary" :loading="saving" @click="save">{{ t('保存') }}</el-button></template
    >
  </me-dialog>
</template>
<script setup lang="ts">
import { useLocalesI18n } from '@/locales/i18n';
import { formatterAtExec } from '@/utils/helper.js';
import type { FormInstance, FormRules } from 'element-plus';
import { reactive, ref, watch } from 'vue';
import type { CmsCommentInfo } from '../../../api/comment';
import { defaults, infoApi, saveApi } from '../../../api/comment';

const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../../lang/${locale}.json`), 'cms']);
const props = defineProps<{ id?: string; readonly?: boolean }>();
const emit = defineEmits<{ success: []; closed: [] }>();
const show = defineModel<boolean>();
const states = ['待审核', '展示', '关闭'];
const form = reactive(defaults());
const formEl = ref<FormInstance>();
/** 详情原始数据，用于展示所属文章、状态、举报等只读信息 */
const detail = ref<CmsCommentInfo>();
/** 加载失败时显式提示，避免出现“弹窗打开但表单全空”的静默失败 */
const error = ref('');
const { runAsync: getInfo, loading } = infoApi();
const { runAsync: saveInfo, loading: saving } = saveApi();

const rules: FormRules = { articleId: [{ required: true, message: t('必填'), trigger: 'blur' }], author: [{ required: true, message: t('必填'), trigger: 'blur' }], content: [{ required: true, message: t('必填'), trigger: 'blur' }] };
const save = async () => {
  if (!(await formEl.value?.validate().catch(() => false))) return;
  try {
    await saveInfo(props.id, form);
  } catch {
    return;
  }
  show.value = false;
  emit('success');
};
// 不要在 setup 里 await 语言包：顶层 await 会让组件变成异步组件，未用 Suspense 包裹时弹窗内容失去响应式更新
void loadRes;
watch(
  () => props.id,
  async (id) => {
    Object.assign(form, defaults());
    detail.value = undefined;
    error.value = '';
    if (!id) return;
    try {
      const data = await getInfo(id);
      detail.value = data;
      for (const key of Object.keys(form) as Array<keyof typeof form>) Object.assign(form, { [key]: data[key] });
    } catch (e: any) {
      error.value = e?.message ? `评论信息加载失败：${e.message}` : '评论信息加载失败，请重试';
    }
  },
  { immediate: true },
);
</script>
<style scoped>
.editor-alert {
  margin-top: 12px;
}
.editor-article {
  width: 100%;
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.editor-desc {
  margin-top: 16px;
}
.editor-desc :deep(.el-descriptions__label) {
  width: 104px;
  color: var(--el-text-color-secondary);
}
</style>
