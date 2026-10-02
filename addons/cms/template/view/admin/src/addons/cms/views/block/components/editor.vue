<template>
  <me-dialog v-model="show" :title="t(readonly ? '详情' : id ? '编辑' : '新增')" :close-on-click-modal="false" class="block-editor-dialog" @closed="emit('closed')">
    <el-form ref="formEl" class="block-editor-form" :model="form" :rules="rules" :disabled="readonly || loading" label-position="top">
      <div class="editor-main-column">
        <section class="editor-section">
          <h4 class="editor-section-title">基础信息</h4>
          <el-form-item :label="t('名称')" prop="title"><el-input v-model="form.title" size="large" :placeholder="namePlaceholder" /><span class="field-hint">仅用于后台识别，不会展示在前台。</span></el-form-item>
          <el-form-item :label="t('前台标题')" prop="displayTitle">
            <el-input v-model="form.displayTitle" maxlength="200" placeholder="留空则不展示；填写后鼠标移入区块可看到该标题" />
            <span class="field-hint">前台渲染时写入 title 属性，鼠标移入区块任意位置时以原生提示展示。</span>
          </el-form-item>
          <el-form-item :label="t('SEO 标识')" prop="slug"><el-input v-model="form.slug" placeholder="英文短横线标识，例如：home-banner-1" /><span class="field-hint">同一位置内建议保持唯一，便于模板引用。</span></el-form-item>
          <el-form-item :label="t('展示位置')" prop="position">
            <el-select v-model="form.position" filterable class="position-select" :disabled="readonly">
              <el-option v-for="item in positions" :key="item.value" :value="item.value" :label="item.label">
                <span class="position-option"><b>{{ item.label }}</b><em>{{ item.value }}</em></span>
              </el-option>
            </el-select>
            <span class="field-hint">位置决定区块在前台的渲染位置，选中后下方会同步说明内容怎么放。</span>
          </el-form-item>
        </section>

        <section v-if="currentPosition" class="editor-section position-section">
          <div class="position-card">
            <div class="position-card-head">
              <h4 class="editor-section-title">{{ currentPosition.label }}</h4>
              <el-tag size="small" effect="plain" type="primary">{{ currentPosition.renderLabel }}</el-tag>
              <el-tag v-if="currentPosition.limit" size="small" effect="plain" type="warning">最多 {{ currentPosition.limit }} 个</el-tag>
            </div>
            <p class="position-desc">{{ currentPosition.desc }}</p>
            <ul class="position-usage">
              <li v-for="item in currentPosition.usage" :key="item.field">
                <b>{{ item.label }}</b>
                <span>{{ item.hint }}</span>
              </li>
            </ul>
            <el-alert class="position-image-tip" :title="imageTitle" type="info" :closable="false" />
          </div>
          <BlockPositionPreview :position="form.position" />
        </section>

        <section v-if="currentPosition" class="editor-section">
          <h4 class="editor-section-title">{{ materialTitle }}</h4>
          <el-form-item :label="imageLabel" prop="coverUrl">
            <!-- 图片统一由上传按钮产生，上传后可即时预览；不允许手填外链，避免前台加载失败 -->
            <me-upload accept=".png,.jpg,.jpeg,.webp" :limit="1" list-type="picture" :model-value="uploadValue(form.coverUrl)" @update:model-value="(files) => (form.coverUrl = files[0]?.url ?? '')" />
            <el-alert class="field-tip" :title="currentPosition.imageHint" type="info" :closable="false" />
          </el-form-item>
          <el-form-item v-if="showEditor" :label="t('正文内容')" prop="mdContent"><me-wang-editor v-model="form.mdContent" :config="editorConfig" /></el-form-item>
          <el-form-item v-if="showLink" :label="t('链接')" prop="link"><el-input v-model="form.link" placeholder="站内路径如 /aon/cms/download，或完整网址 https://" /></el-form-item>
          <el-form-item v-if="currentPosition.render === 'config'" label="排行规则" prop="config">
            <el-input v-model="form.config" type="textarea" :rows="3" maxlength="20000" :placeholder="currentPosition.configSample ?? ''" />
            <div class="config-actions">
              <span class="field-hint">sortBy 可选 latest / likes / comments / views；limit 取值 1-50。</span>
              <el-button v-if="!readonly" link type="primary" @click="form.config = currentPosition.configSample ?? ''">填入示例</el-button>
            </div>
          </el-form-item>
        </section>
      </div>

      <aside class="editor-side-column">
        <section class="editor-side-section">
          <h4>投放设置</h4>
          <el-form-item :label="t('排序')" prop="orderNum"><el-input-number :key="String(readonly || loading)" v-model="form.orderNum" :min="-9999" :max="9999" /><span class="field-hint">数值越大越靠前，同一位置内生效。</span></el-form-item>
          <el-form-item :label="t('状态')" prop="status"><el-select v-model="form.status"><el-option :value="0" :label="t('禁用')" /><el-option :value="1" :label="t('启用')" /></el-select></el-form-item>
          <el-form-item :label="t('开始时间')" prop="startAt"><el-date-picker v-model="form.startAt" type="datetime" value-format="YYYY-MM-DDTHH:mm:ssZ" clearable /><span class="field-hint">留空表示立即生效。</span></el-form-item>
          <el-form-item :label="t('结束时间')" prop="endAt"><el-date-picker v-model="form.endAt" type="datetime" value-format="YYYY-MM-DDTHH:mm:ssZ" clearable /><span class="field-hint">留空表示长期有效。</span></el-form-item>
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
import { useLocalesI18n } from '@/locales/i18n';
import type { FormInstance, FormRules } from 'element-plus';
import { computed, reactive, ref, watch } from 'vue';
import { defaults, infoApi, positionsApi, saveApi } from '../../../api/block';
import type { CmsBlockPosition } from '../../../api/block';
import MeWangEditor from '@/components/meWangEditor/index.vue';
import BlockPositionPreview from './blockPositionPreview.vue';

const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../../lang/${locale}.json`), 'cms']);
const props = defineProps<{ id?: string; readonly?: boolean }>();
const emit = defineEmits<{ success: []; closed: [] }>();
const show = defineModel<boolean>();
const form = reactive(defaults());
const formEl = ref<FormInstance>();
const { runAsync: getInfo, loading } = infoApi();
const { runAsync: saveInfo, loading: saving } = saveApi();
const { runAsync: getPositions, data: positionsData } = positionsApi();
const positions = computed<CmsBlockPosition[]>(() => positionsData.value ?? []);
const currentPosition = computed(() => positions.value.find((item) => item.value === form.position) ?? positions.value[0]);

const editorConfig = { editor: { placeholder: '请输入区块正文...' } };
// 回显已保存的图片：把 URL 还原成上传组件需要的文件对象，保证编辑时可见预览
const uploadValue = (url: string): FileInfo[] => (url ? ([{ url, name: url.split('/').pop() ?? 'image' }] as FileInfo[]) : []);

const rules: FormRules = {
  title: [{ required: true, message: t('必填'), trigger: 'blur' }],
  slug: [{ required: true, message: t('必填'), trigger: 'blur' }],
  position: [{ required: true, message: t('必填'), trigger: 'change' }],
  link: [{ validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => (currentPosition.value?.render === 'image-link' && !value ? callback(new Error('图片推广位必须填写链接')) : callback()), trigger: 'blur' }],
  mdContent: [{ validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => (currentPosition.value?.render === 'content' && !value?.trim() ? callback(new Error('请填写正文内容')) : callback()), trigger: 'blur' }],
};

const materialTitle = computed(() => {
  switch (currentPosition.value?.render) {
    case 'carousel':
      return '轮播素材';
    case 'image-link':
      return '推广素材';
    case 'config':
      return '排行配置';
    default:
      return '区块内容';
  }
});
const imageLabel = computed(() => (currentPosition.value?.render === 'carousel' ? '轮播大图' : currentPosition.value?.render === 'config' ? '封面（不使用）' : '封面图'));
const imageTitle = computed(() => currentPosition.value?.imageHint ?? '');
const namePlaceholder = computed(() => (currentPosition.value?.render === 'carousel' ? '例如：meadmin 全新版本发布' : '用于识别区块的名称，不一定展示在前台'));
const showEditor = computed(() => currentPosition.value?.render === 'content');
const showLink = computed(() => currentPosition.value?.render !== 'config');

const save = async () => {
  if (!(await formEl.value?.validate().catch(() => false))) return;
  await saveInfo(props.id, form);
  show.value = false;
  emit('success');
};
await loadRes;
await getPositions();
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
<style scoped>
.block-editor-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 28px;
  align-items: start;
}
.editor-main-column,
.editor-side-column {
  min-width: 0;
}
.editor-side-column {
  position: sticky;
  top: 0;
  align-self: start;
  padding-left: 24px;
  border-left: 1px solid var(--el-border-color-lighter);
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
.block-editor-form :deep(.el-form-item) {
  margin-bottom: 16px;
}
.block-editor-form :deep(.el-form-item__label) {
  margin-bottom: 4px;
  line-height: 1.4;
}
.block-editor-form .editor-section {
  margin-bottom: 18px;
}
.editor-section-title {
  margin: 0 0 12px;
  color: #1f2733;
  font-size: 15px;
  font-weight: 700;
}
.field-hint {
  display: block;
  margin-top: 6px;
  color: #98a1af;
  font-size: 12px;
  line-height: 1.6;
}
.field-tip {
  margin-top: 8px;
}
.position-select {
  width: 100%;
}
.position-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.position-option em {
  color: #a2abb9;
  font-size: 12px;
  font-style: normal;
}
.position-card {
  padding: 14px 16px 4px;
  border: 1px solid #e6eaf2;
  border-radius: 10px;
  background: #fff;
}
.position-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.position-card-head .editor-section-title {
  margin: 0;
}
.position-desc {
  margin: 0 0 12px;
  color: #5b6472;
  font-size: 13px;
  line-height: 1.75;
}
.position-usage {
  margin: 0 0 12px;
  padding: 0;
  list-style: none;
}
.position-usage li {
  display: flex;
  gap: 10px;
  padding: 6px 0;
  border-top: 1px dashed #eceff5;
  font-size: 13px;
  line-height: 1.6;
}
.position-usage li:first-child {
  border-top: 0;
}
.position-usage li b {
  flex: 0 0 72px;
  color: #2b3444;
  font-weight: 600;
}
.position-usage li span {
  min-width: 0;
  color: #6b7482;
}
.position-image-tip,
.position-section > .pos-preview {
  margin-bottom: 16px;
}
.config-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 6px;
}
.config-actions .field-hint {
  margin-top: 0;
}
@media (max-width: 900px) {
  .block-editor-form {
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
</style>
