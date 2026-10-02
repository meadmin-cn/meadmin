<template>
  <me-dialog v-model="show" :title="t(readonly ? '详情' : id ? '编辑' : '新增')" :close-on-click-modal="false" class="article-editor-dialog" @closed="emit('closed')">
    <el-alert class="editor-alert" :title="t('保存后内容将回到草稿，需重新审核')" type="info" :closable="false" />

    <!-- 富文本编辑器在数据回填前挂载会因内容由空变有而抛错，进而中断本次补丁（后面的字段都不会更新），
         因此等详情加载完成后再渲染整个表单 -->
    <el-form v-if="ready" ref="formEl" class="article-editor-form" :model="form" :rules="rules" :disabled="readonly || loading" label-position="top">
      <div class="editor-main-column">
        <el-form-item :label="t('标题')" prop="title"><el-input v-model="form.title" size="large" placeholder="请输入文章标题" /></el-form-item>
        <el-form-item :label="t('摘要')" prop="summary"><el-input v-model="form.summary" type="textarea" :rows="3" placeholder="用于列表、搜索和 SEO 摘要展示" /></el-form-item>
        <el-form-item :label="t('正文内容')" prop="mdContent">
          <me-wang-editor v-model="form.mdContent" :config="editorConfig" />
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
          <el-form-item :label="t('专题')" prop="topicId"
            ><el-select v-model="form.topicId" clearable filterable remote :remote-method="lookupTopics"><el-option v-for="option in topics" :key="option.id" :value="option.id" :label="option.title" /></el-select
          ></el-form-item>
          <el-form-item :label="t('标签')" prop="tagIds"
            ><el-select v-model="form.tagIds" multiple filterable remote :remote-method="lookupTags" :loading="tagsLoading"><el-option v-for="option in tags" :key="option.id" :value="option.id" :label="option.title" /></el-select
          ></el-form-item>
          <el-form-item :label="t('发布时间')" prop="publishAt"><el-date-picker v-model="form.publishAt" type="datetime" value-format="YYYY-MM-DDTHH:mm:ssZ" clearable /></el-form-item>
          <el-form-item :label="t('排序')" prop="orderNum"><el-input-number :key="String(readonly || loading)" v-model="form.orderNum" :min="-9999" :max="9999" /></el-form-item>
        </section>
        <section class="editor-side-section">
          <h4>内容设置</h4>
          <el-form-item :label="t('封面')" prop="coverUrl">
            <!-- 图片统一由上传按钮产生，上传后可即时预览 -->
            <me-upload accept=".png,.jpg,.jpeg,.webp" :limit="1" list-type="picture" :model-value="uploadValue(form.coverUrl)" @update:model-value="(files) => (form.coverUrl = files[0]?.url ?? '')" />
            <el-alert class="cover-tip" title="建议上传 1200×800（3:2）图片，单张体积不超过 500MB" type="info" :closable="false" />
          </el-form-item>
          <el-form-item label="详情页订单" prop="orderEnabled"><el-switch v-model="form.orderEnabled" active-text="启用创建订单" inactive-text="关闭" /></el-form-item>
          <el-form-item label="可下载" prop="isDownload"><el-switch v-model="form.isDownload" active-text="作为下载内容" inactive-text="普通文章" /></el-form-item>
          <el-form-item label="图集精选" prop="isGallery"><el-switch v-model="form.isGallery" active-text="展示在首页图集精选" inactive-text="普通文章" /></el-form-item>
        </section>
        <section v-if="form.isDownload" class="editor-side-section">
          <h4>下载文件</h4>
          <el-form-item label="关联文件" prop="fileUrl">
            <me-upload
              accept="*"
              :limit="1"
              @update:model-value="
                (files: Array<{ url?: string; name?: string }>) => {
                  form.fileUrl = files[0]?.url ?? '';
                  form.fileName = files[0]?.name ?? '';
                }
              "
            >
              <template #tip
                ><span class="up-tip">{{ form.fileName || '请上传下载关联文件' }}</span></template
              >
            </me-upload>
          </el-form-item>
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
import type { FileInfo } from '@/api/file';
import MeWangEditor from '@/components/meWangEditor/index.vue';
import { useLocalesI18n } from '@/locales/i18n';
import type { FormInstance, FormRules } from 'element-plus';
import { reactive, ref, watch } from 'vue';
import { defaults, infoApi, saveApi } from '../../../api/article';
import { treeApi } from '../../../api/category';
import { lookupApi } from '../../../api/options';
const editorConfig = { editor: { placeholder: '请输入文章正文内容...' } };
// el-upload 通过 TransitionGroup 渲染列表，key 取 uid || name，回显文件必须带上唯一 uid 才会渲染
let uploadUid = 0;
const uploadValue = (url: unknown): FileInfo[] => (typeof url === 'string' && url ? ([{ uid: -++uploadUid, url, name: url.split('/').pop() ?? 'image' }] as unknown as FileInfo[]) : []);
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
// 详情加载完成后才渲染表单（详见模板中的说明）
const ready = ref(false);
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
// 不要在 setup 里 await 语言包：顶层 await 会让组件变成异步组件，未用 Suspense 包裹时弹窗内容失去响应式更新
void loadRes;
watch(
  () => props.id,
  async (id) => {
    Object.assign(form, defaults());
    if (id) {
      ready.value = false;
      const data = await getInfo(id);
      for (const key of Object.keys(form) as Array<keyof typeof form>) Object.assign(form, { [key]: data[key] });
    }
    ready.value = true;

    await Promise.all([getCategories(), lookupTags(), lookupTopics()]);
  },
  { immediate: true },
);
</script>
<style scoped>
.article-editor-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 28px;
  align-items: start;
}
.editor-alert {
  margin-bottom: 18px;
  border-radius: 8px;
}
.editor-main-column,
.editor-side-column {
  min-width: 0;
}
/* 侧栏在长正文滚动时保持可见，避免“发布设置”被滚出视野 */
.editor-side-column {
  position: sticky;
  top: 0;
  align-self: start;
  padding-left: 24px;
  border-left: 1px solid var(--el-border-color-lighter);
}
.editor-side-section + .editor-side-section {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.editor-side-section h4 {
  position: relative;
  margin: 0 0 14px;
  padding-left: 10px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  line-height: 1.4;
}
.editor-side-section h4::before {
  position: absolute;
  top: 1px;
  bottom: 1px;
  left: 0;
  width: 3px;
  content: '';
  background: var(--el-color-primary);
  border-radius: 2px;
}
.article-editor-form :deep(.el-form-item) {
  margin-bottom: 16px;
}
.article-editor-form :deep(.el-form-item__label) {
  margin-bottom: 4px;
  line-height: 1.4;
}
.seo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}
@media (max-width: 900px) {
  .article-editor-form {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .editor-side-column {
    position: static;
    padding-top: 18px;
    padding-left: 0;
    border-top: 1px solid var(--el-border-color-lighter);
    border-left: 0;
  }
}
@media (max-width: 560px) {
  .seo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
