<template>
  <me-dialog v-model="show" :title="t(readonly ? '详情' : id ? '编辑' : '新增')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-form ref="formEl" :model="form" :rules="rules" :disabled="readonly || loading" label-position="top">
      <el-form-item :label="t('名称')" prop="title"><el-input v-model="form.title" /></el-form-item>
      <el-form-item :label="t('SEO 标识')" prop="slug"><el-input v-model="form.slug" /></el-form-item>
      <el-form-item :label="t('摘要')" prop="summary"><el-input v-model="form.summary" type="textarea" :rows="3" /></el-form-item>

      <!-- 内容类型：决定前台访问专题时落地到哪类内容 -->
      <el-form-item :label="t('内容类型')" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio-button v-for="item in topicTypes" :key="item.value" :value="item.value">{{ item.label }}</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 内置内容：保留原有 Markdown 编辑 -->
      <template v-if="form.type === 1">
        <el-form-item :label="t('Markdown 内容')" prop="mdContent"><el-input v-model="form.mdContent" type="textarea" :rows="14" maxlength="200000" /><cms-preview :content="form.mdContent" /></el-form-item>
      </template>

      <!-- 外链：填写目标地址与打开方式 -->
      <template v-else-if="form.type === 2">
        <el-form-item :label="t('跳转链接')" prop="target">
          <el-input v-model="form.target" placeholder="https:// 或站内路径，如 /aon/cms/page/about" />
        </el-form-item>
        <el-form-item :label="t('打开方式')">
          <el-radio-group v-model="form.targetBlank">
            <el-radio :value="0">当前窗口</el-radio>
            <el-radio :value="1">新窗口</el-radio>
          </el-radio-group>
        </el-form-item>
      </template>

      <!-- 文章：选择一篇已发布文章 -->
      <template v-else-if="form.type === 3">
        <el-form-item :label="t('关联文章')" prop="target">
          <el-select v-model="form.target" filterable clearable placeholder="选择文章" style="width: 100%">
            <el-option v-for="opt in articleOptions" :key="opt.id" :value="opt.id" :label="opt.title" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 自定义表单：选择一个已启用表单 -->
      <template v-else-if="form.type === 4">
        <el-form-item :label="t('关联表单')" prop="target">
          <el-select v-model="form.target" filterable clearable placeholder="选择自定义表单" style="width: 100%">
            <el-option v-for="opt in formOptions" :key="opt.id" :value="opt.id" :label="`${opt.title}（${opt.diyname}）`" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 目录：选择一个栏目，前台展示该栏目内容 -->
      <template v-else-if="form.type === 5">
        <el-form-item :label="t('关联栏目')" prop="target">
          <el-select v-model="form.target" filterable clearable placeholder="选择栏目" style="width: 100%">
            <el-option v-for="opt in categoryOptions" :key="opt.id" :value="opt.id" :label="opt.title" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 单页：选择一个已发布单页 -->
      <template v-else-if="form.type === 6">
        <el-form-item :label="t('关联单页')" prop="target">
          <el-select v-model="form.target" filterable clearable placeholder="选择单页" style="width: 100%">
            <el-option v-for="opt in pageOptions" :key="opt.id" :value="opt.id" :label="opt.title" />
          </el-select>
        </el-form-item>
      </template>

      <el-alert v-if="previewUrl" class="cover-tip" type="success" :closable="false">
        <template #title>{{ t('前台访问地址') }}：<span class="topic-link">{{ previewUrl }}</span></template>
      </el-alert>

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
import { computed, reactive, ref, watch } from 'vue';
import { defaults, infoApi, saveApi } from '../../../api/topic';
import { listApi as articleListApi } from '../../../api/article';
import { listApi as diyformListApi } from '../../../api/diyform';
import { listApi as pageListApi } from '../../../api/page';
import { treeApi as categoryTreeApi } from '../../../api/category';
import { cmsFrontRoot } from '../../../components/accessUrl';
import CmsPreview from '../../../components/cmsPreview.vue';

const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../../lang/${locale}.json`), 'cms']);
const props = defineProps<{ id?: string; readonly?: boolean }>();
const emit = defineEmits<{ success: []; closed: [] }>();
const show = defineModel<boolean>();
const form = reactive(defaults());
const formEl = ref<FormInstance>();
const { runAsync: getInfo, loading } = infoApi();
const { runAsync: saveInfo, loading: saving } = saveApi();

// 专题内容类型：1内置内容 2外链 3文章 4自定义表单 5目录 6单页
const topicTypes: Array<{ value: number; label: string }> = [
  { value: 1, label: '内置内容' },
  { value: 2, label: '外链' },
  { value: 3, label: '文章' },
  { value: 4, label: '自定义表单' },
  { value: 5, label: '目录' },
  { value: 6, label: '单页' },
];

// 关联目标选项：随类型切换加载对应列表
const articleOptions = ref<Array<{ id: string; title: string }>>([]);
const formOptions = ref<Array<{ id: string; title: string; diyname: string }>>([]);
const pageOptions = ref<Array<{ id: string; title: string }>>([]);
const categoryOptions = ref<Array<{ id: string; title: string }>>([]);
const flattenCategory = (items: Array<{ id: string; title: string; children?: any[] }>, prefix = ''): Array<{ id: string; title: string }> => {
  const out: Array<{ id: string; title: string }> = [];
  for (const item of items) {
    out.push({ id: item.id, title: prefix ? `${prefix} / ${item.title}` : item.title });
    if (item.children?.length) out.push(...flattenCategory(item.children, item.title));
  }
  return out;
};
const loadOptions = async () => {
  try {
    const [articles, forms, pages, categories] = await Promise.all([
      articleListApi().runAsync({ page: 1, pageSize: 200 }),
      diyformListApi().runAsync({ page: 1, pageSize: 200 }),
      pageListApi().runAsync({ page: 1, pageSize: 200 }),
      categoryTreeApi().runAsync(),
    ]);
    articleOptions.value = (articles.list ?? []).map((item: any) => ({ id: item.id, title: item.title }));
    formOptions.value = (forms.list ?? []).map((item: any) => ({ id: item.id, title: item.title, diyname: item.diyname }));
    pageOptions.value = (pages.list ?? []).map((item: any) => ({ id: item.id, title: item.title }));
    categoryOptions.value = flattenCategory(categories ?? []);
  } catch {
    // 选项加载失败不影响主表单，保留空选项
  }
};

// 前台访问地址预览：根据类型与当前选择实时拼接（与后台解析规则一致）
const previewUrl = computed(() => {
  const root = cmsFrontRoot();
  const base = `${root}/aon/cms`;
  if (form.type === 2) return form.target ? (/^(https?:)?\/\//i.test(form.target) ? form.target : `${root}${form.target.startsWith('/') ? '' : '/'}${form.target}`) : '';
  if (form.type === 3 && form.target) return `${base}/article/<slug>`;
  if (form.type === 4 && form.target) return `${base}/form/<diyname>`;
  if (form.type === 5 && form.target) return `${base}/category/<slug>`;
  if (form.type === 6 && form.target) return `${base}/page/<slug>`;
  return `${base}/topic/${form.slug || '<slug>'}`;
});

// el-upload 通过 TransitionGroup 渲染列表，key 取 uid || name，回显文件必须带上唯一 uid 才会渲染
let uploadUid = 0;
const uploadValue = (url: unknown): FileInfo[] => (typeof url === 'string' && url ? ([{ uid: -++uploadUid, url, name: url.split('/').pop() ?? 'image' }] as unknown as FileInfo[]) : []);
const rules: FormRules = {
  title: [{ required: true, message: t('必填'), trigger: 'blur' }],
  slug: [{ required: true, message: t('必填'), trigger: 'blur' }],
  target: [{ required: true, message: t('请选择关联目标'), trigger: 'change' }],
};
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
      const data = await getInfo(id);
      for (const key of Object.keys(form) as Array<keyof typeof form>) Object.assign(form, { [key]: data[key] });
    }
    await loadOptions();
  },
  { immediate: true },
);
</script>
<style scoped>
.topic-link {
  font-weight: 600;
  word-break: break-all;
}
</style>
