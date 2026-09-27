<template>
  <me-dialog v-model="show" :title="t(readonly ? '详情' : id ? '编辑' : '新增')" :close-on-click-modal="false" class="article-editor-dialog" @closed="emit('closed')">
    <el-alert :title="t('保存后内容将回到草稿，需重新审核')" type="info" :closable="false" />

    <el-form ref="formEl" class="article-editor-form" :model="form" :rules="rules" :disabled="readonly || loading" label-position="top">
      <div class="editor-main-column">
        <el-form-item :label="t('标题')" prop="title"><el-input v-model="form.title" size="large" placeholder="请输入文章标题" /></el-form-item>
        <el-form-item :label="t('摘要')" prop="summary"><el-input v-model="form.summary" type="textarea" :rows="3" placeholder="用于列表、搜索和 SEO 摘要展示" /></el-form-item>
        <el-form-item :label="t('正文内容')" prop="mdContent">
          <me-wang-editor v-model="form.mdContent" :config="editorConfig" />
          <el-alert class="editor-tip" title="正文使用 me-admin 内置富文本编辑器，保存为 HTML；历史 Markdown 内容仍可继续编辑。" type="info" :closable="false" />
        </el-form-item>
        <el-divider content-position="left">SEO 设置</el-divider>
        <el-form-item :label="t('SEO 标识')" prop="slug"><el-input v-model="form.slug" placeholder="例如：getting-started" /></el-form-item>
        <div class="seo-grid">
          <el-form-item :label="t('SEO 标题')" prop="seoTitle"><el-input v-model="form.seoTitle" /></el-form-item>
          <el-form-item :label="t('SEO 关键词')" prop="seoKeywords"><el-input v-model="form.seoKeywords" /></el-form-item>
        </div>
        <el-form-item :label="t('SEO 描述')" prop="seoDescription"><el-input v-model="form.seoDescription" type="textarea" :rows="3" /></el-form-item>
      </div>
      <aside class="editor-side-column">
        <section class="editor-side-section">
          <h4>发布设置</h4>
          <el-form-item :label="t('栏目')" prop="categoryId"><el-tree-select v-model="form.categoryId" :data="categories ?? []" :props="{ label: 'title' }" node-key="id" check-strictly clearable /></el-form-item>
          <el-form-item :label="t('专题')" prop="topicId"><el-select v-model="form.topicId" clearable filterable remote :remote-method="lookupTopics"><el-option v-for="option in topics" :key="option.id" :value="option.id" :label="option.title" /></el-select></el-form-item>
          <el-form-item :label="t('标签')" prop="tagIds"><el-select v-model="form.tagIds" multiple filterable remote :remote-method="lookupTags" :loading="tagsLoading"><el-option v-for="option in tags" :key="option.id" :value="option.id" :label="option.title" /></el-select></el-form-item>
          <el-form-item :label="t('发布时间')" prop="publishAt"><el-date-picker v-model="form.publishAt" type="datetime" value-format="YYYY-MM-DDTHH:mm:ssZ" clearable /></el-form-item>
          <el-form-item :label="t('排序')" prop="orderNum"><el-input-number :key="String(readonly || loading)" v-model="form.orderNum" :min="-9999" :max="9999" /></el-form-item>
        </section>
        <section class="editor-side-section">
          <h4>内容设置</h4>
          <el-form-item :label="t('封面')" prop="coverUrl"><el-input v-model="form.coverUrl" maxlength="1000" placeholder="图片 URL" /><me-upload accept=".png,.jpg,.jpeg,.webp" :limit="1" list-type="picture" @update:model-value="(files) => (form.coverUrl = files[0]?.url ?? '')" /></el-form-item>
          <el-form-item label="详情页订单" prop="orderEnabled"><el-switch v-model="form.orderEnabled" active-text="启用创建订单" inactive-text="关闭" /></el-form-item>
        </section>
      </aside>
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
import { defaults, infoApi, saveApi } from '../../../api/article';
import { treeApi } from '../../../api/category';
import { lookupApi } from '../../../api/options';
import MeWangEditor from '@/components/meWangEditor/index.vue';
const editorConfig = { editor: { placeholder: '请输入文章正文内容...' } };
const { runAsync: getCategories, data: categories } = treeApi();
const { runAsync: getTags, loading: tagsLoading } = lookupApi();
const { runAsync: getTopics } = lookupApi();
const tags = ref<Array<{ id: string; title: string }>>([]);
const topics = ref<Array<{ id: string; title: string }>>([]);
const lookupTags = async (keyword = '') => {
  tags.value = await getTags('tag', keyword, form.tagIds);
};
const lookupTopics = async (keyword = '') => {
  topics.value = await getTopics('topic', keyword, form.topicId ? [form.topicId] : []);
};
const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../../lang/${locale}.json`), 'cms']);
const props = defineProps<{ id?: string; readonly?: boolean }>();
const emit = defineEmits<{ success: []; closed: [] }>();
const show = defineModel<boolean>();
const form = reactive(defaults());
const formEl = ref<FormInstance>();
const { runAsync: getInfo, loading } = infoApi();
const { runAsync: saveInfo, loading: saving } = saveApi();

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

    await Promise.all([getCategories(), lookupTags(), lookupTopics()]);
  },
  { immediate: true },
);
</script>
<style scoped>
.article-editor-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 24px;
}
.editor-main-column,
.editor-side-column {
  min-width: 0;
}
.editor-side-column {
  padding-left: 20px;
  border-left: 1px solid var(--el-border-color-lighter);
}
.editor-side-section + .editor-side-section {
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.editor-side-section h4 {
  margin: 0 0 16px;
  color: var(--el-text-color-primary);
  font-size: 14px;
}
.editor-tip {
  margin-top: 10px;
}
.seo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
@media (max-width: 900px) {
  .article-editor-form {
    grid-template-columns: 1fr;
  }
  .editor-side-column {
    padding-top: 20px;
    padding-left: 0;
    border-top: 1px solid var(--el-border-color-lighter);
    border-left: 0;
  }
}
@media (max-width: 560px) {
  .seo-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
