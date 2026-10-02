<template>
  <section class="message-page">
    <div class="message-shell">
      <header class="page-heading">
        <div>
          <span class="page-kicker">交流反馈</span>
          <h1>{{ form?.title || '留言板' }}</h1>
          <p>{{ form?.description || '欢迎提出建议或反馈问题，公开留言会在审核后展示。' }}</p>
        </div>
        <el-button v-if="fields.length" type="primary" @click="editorOpen = !editorOpen">{{ editorOpen ? '收起表单' : '填写表单' }}</el-button>
      </header>

      <!-- 表单字段完全由后台「自定义表单」配置驱动 -->
      <section v-show="editorOpen && fields.length" class="message-editor">
        <div class="editor-heading">
          <div>
            <h2>填写{{ form?.title || '表单' }}</h2>
            <p>带 * 的为必填项，联系方式仅管理员可见。</p>
          </div>
          <button type="button" aria-label="关闭表单" @click="editorOpen = false">×</button>
        </div>
        <el-form label-position="top" class="message-form">
          <el-form-item v-for="field in fields" :key="field.name" :label="field.label + (field.required ? ' *' : '')" :class="{ 'content-field': field.type === 'textarea' }">
            <el-input v-if="field.type === 'text'" v-model="formData[field.name] as string" :maxlength="field.maxlength || 200" :placeholder="field.placeholder" />
            <el-input v-else-if="field.type === 'textarea'" v-model="formData[field.name] as string" type="textarea" :rows="4" :maxlength="field.maxlength || 2000" show-word-limit :placeholder="field.placeholder" />
            <el-input-number v-else-if="field.type === 'number'" v-model="formData[field.name] as number" controls-position="right" />
            <el-select v-else-if="field.type === 'select'" v-model="formData[field.name] as string" :placeholder="field.placeholder || '请选择'" clearable>
              <el-option v-for="option in field.options ?? []" :key="option" :value="option" :label="option" />
            </el-select>
            <el-radio-group v-else-if="field.type === 'radio'" v-model="formData[field.name] as string">
              <el-radio v-for="option in field.options ?? []" :key="option" :value="option">{{ option }}</el-radio>
            </el-radio-group>
            <el-checkbox-group v-else-if="field.type === 'checkbox'" v-model="formData[field.name] as string[]">
              <el-checkbox v-for="option in field.options ?? []" :key="option" :value="option">{{ option }}</el-checkbox>
            </el-checkbox-group>
            <el-date-picker v-else-if="field.type === 'date'" v-model="formData[field.name] as string" type="date" value-format="YYYY-MM-DD" :placeholder="field.placeholder || '请选择日期'" />
            <me-upload v-else-if="field.type === 'image'" accept=".png,.jpg,.jpeg,.webp" :limit="1" list-type="picture" :model-value="uploadValue(formData[field.name])" @update:model-value="(files) => (formData[field.name] = files[0]?.url ?? '')" />
            <el-input v-else v-model="formData[field.name] as string" :maxlength="field.maxlength || 200" :placeholder="field.placeholder" />
          </el-form-item>
          <div class="submit-row">
            <span>{{ form?.needReview ? '提交后需经管理员审核' : '提交后立即生效' }}</span>
            <el-button type="primary" :loading="submitting" :disabled="!canSubmit" @click="submit">{{ form?.submitText || '提交' }}</el-button>
          </div>
        </el-form>
      </section>
      <el-alert v-if="!loading && !fields.length" class="message-alert" type="warning" :closable="false" title="留言板表单尚未配置" description="请在后台「CMS - 自定义表单」中新建表单并开启「作为前台留言板」。" />

      <section class="message-stream">
        <div class="stream-header">
          <div>
            <h2>公开数据</h2>
            <span>共 {{ data?.total ?? 0 }} 条</span>
          </div>
          <button type="button" @click="load">刷新列表</button>
        </div>
        <div v-loading="loading" class="stream-list">
          <article v-for="item in data?.list" :key="item.id" class="message-item">
            <div class="message-avatar">{{ (item.author || '匿').slice(0, 1) }}</div>
            <div class="message-copy">
              <header>
                <strong>{{ item.author || '匿名' }}</strong
                ><time>{{ formatterAtExec(item.createdAt, 'YYYY-MM-DD') }}</time>
              </header>
              <p>{{ item.content }}</p>
              <!-- 其余字段按表单配置补充展示 -->
              <div v-if="extraEntries(item).length" class="message-extra">
                <span v-for="entry in extraEntries(item)" :key="entry.label"><b>{{ entry.label }}</b>{{ entry.value }}</span>
              </div>
              <div v-if="item.reply" class="reply">
                <span>管理员回复</span>
                <p>{{ item.reply }}</p>
              </div>
            </div>
          </article>
          <div v-if="data && !data.total" class="empty-state"><strong>暂无公开数据</strong><span>点击右上角按钮提交第一条</span></div>
        </div>
        <el-pagination v-if="data?.total" v-model:current-page="page" :page-size="pageSize" :total="data.total" layout="prev,pager,next" class="pagination" @current-change="load" />
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FileInfo } from '@/api/file';
import { ElMessage } from 'element-plus';
import { computed, reactive, ref } from 'vue';
import { formatterAtExec } from '@/utils/helper';
import type { CmsDiyformField, CmsDiyformRecord } from '../api/cms';
import { messageBoardApi, submitDiyformApi } from '../api/cms';

const editorOpen = ref(false);
const submitting = ref(false);
const loading = ref(false);
const page = ref(1);
const pageSize = 10;
// 提交内容以字段名称为键，结构完全来自后台配置
const formData = reactive<Record<string, unknown>>({});
const { data, runAsync: fetchMessages } = messageBoardApi();
const { runAsync: submitForm } = submitDiyformApi();

const form = computed(() => data.value?.form ?? null);
const fields = computed<CmsDiyformField[]>(() => form.value?.fields ?? []);
// 未上传图片时回显为空；已上传时还原成上传组件需要的文件对象
const uploadValue = (url: unknown): FileInfo[] => (typeof url === 'string' && url ? ([{ url, name: url.split('/').pop() ?? 'image' }] as FileInfo[]) : []);

// 必填项校验：全部必填字段都有值才允许提交（未满足时按钮置灰）
const canSubmit = computed(() =>
  fields.value.every((field) => {
    if (!field.required) return true;
    const value = formData[field.name];
    if (Array.isArray(value)) return value.length > 0;
    if (field.type === 'number') return typeof value === 'number';
    return String(value ?? '').trim().length > 0;
  }),
);

// 公开数据里除正文外的其它字段，按表单配置展示
const extraEntries = (item: CmsDiyformRecord) => {
  const contentField = fields.value.find((field) => field.type === 'textarea');
  return fields.value
    .filter((field) => field.name !== contentField?.name && !['text', 'number'].includes(field.type) && item.data?.[field.name])
    .map((field) => ({ label: field.label, value: Array.isArray(item.data[field.name]) ? (item.data[field.name] as string[]).join('、') : String(item.data[field.name]) }));
};

const load = async () => {
  loading.value = true;
  try {
    await fetchMessages({ page: page.value, pageSize });
    // 首次拿到字段配置后初始化表单模型，避免输入后配置刷新导致内容丢失
    for (const field of fields.value) if (!(field.name in formData)) formData[field.name] = field.type === 'checkbox' ? [] : '';
  } finally {
    loading.value = false;
  }
};
const submit = async () => {
  if (!canSubmit.value) {
    ElMessage.warning('请先填写必填项');
    return;
  }
  if (!form.value) return;
  submitting.value = true;
  try {
    const payload: Record<string, unknown> = {};
    for (const field of fields.value) payload[field.name] = formData[field.name];
    await submitForm(form.value.diyname, payload);
    for (const field of fields.value) formData[field.name] = field.type === 'checkbox' ? [] : '';
    editorOpen.value = false;
    ElMessage.success(form.value.needReview ? '已提交，审核后公开展示' : '提交成功');
  } finally {
    submitting.value = false;
  }
};
await load();
</script>

<style scoped>
.message-page {
  min-height: 100%;
  padding: 28px 20px 60px;
  color: #273248;
  background: #f4f6f9;
  box-sizing: border-box;
}
.message-shell {
  width: min(100%, 960px);
  margin: 0 auto;
}
.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: 4px 4px 22px;
}
.page-kicker {
  color: #202b3d;
  font-size: 12px;
  font-weight: 700;
}
.page-heading h1 {
  margin: 7px 0 6px;
  color: #202b3e;
  font-size: 28px;
  line-height: 1.25;
}
.page-heading p {
  margin: 0;
  color: #7a8597;
  font-size: 14px;
  line-height: 1.7;
}
.message-editor,
.message-stream {
  border: 1px solid #e3e8ef;
  background: #fff;
  box-shadow: 0 3px 12px rgba(32, 47, 78, 0.035);
}
.message-editor {
  margin-bottom: 14px;
  padding: 18px 20px 20px;
}
.message-alert {
  margin-bottom: 14px;
  border-radius: 8px;
}
.editor-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 14px;
  padding-bottom: 13px;
  border-bottom: 1px solid #edf0f4;
}
.editor-heading h2,
.stream-header h2 {
  margin: 0;
  color: #273248;
  font-size: 16px;
}
.editor-heading p {
  margin: 5px 0 0;
  color: #8a94a5;
  font-size: 12px;
}
.editor-heading button {
  width: 28px;
  height: 28px;
  padding: 0;
  color: #8b95a5;
  font-size: 22px;
  line-height: 1;
  border: 0;
  background: transparent;
  cursor: pointer;
}
.message-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
}
.message-form :deep(.el-form-item) {
  margin-bottom: 14px;
}
.message-form :deep(.el-form-item__label) {
  padding-bottom: 5px;
  color: #59667a;
  font-size: 12px;
}
.message-form :deep(.el-input__wrapper),
.message-form :deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px #dfe5ee inset;
}
.content-field,
.submit-row {
  grid-column: 1 / -1;
}
.message-form :deep(.el-textarea__inner) {
  min-height: 104px !important;
  line-height: 1.65;
}
.submit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.submit-row span {
  color: #9aa3b1;
  font-size: 12px;
}
.message-stream {
  padding: 0 20px 22px;
}
.stream-header {
  display: flex;
  height: 54px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e7ebf1;
}
.stream-header > div {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.stream-header span {
  color: #929baa;
  font-size: 12px;
}
.stream-header button {
  padding: 4px 0;
  color: #454b5c;
  font-size: 12px;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: color 0.2s;
}
.stream-header button:hover {
  color: #181c28;
}
.message-item {
  display: flex;
  gap: 14px;
  padding: 18px 4px;
  border-bottom: 1px solid #edf0f4;
}
.message-avatar {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  place-items: center;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  border-radius: 4px;
  background: #5b72e8;
}
.message-copy {
  min-width: 0;
  flex: 1;
}
.message-copy header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.message-copy header strong {
  color: #34415a;
  font-size: 14px;
}
.message-copy time {
  color: #a0a8b5;
  font-size: 11px;
}
.message-extra {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 8px;
  color: #7a8597;
  font-size: 12px;
}
.message-extra b {
  margin-right: 4px;
  color: #98a1af;
  font-weight: 600;
}
.message-copy > p {
  margin: 7px 0 0;
  color: #566176;
  font-size: 13px;
  line-height: 1.75;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.reply {
  margin-top: 12px;
  padding: 10px 12px;
  border-left: 2px solid #5b72e8;
  background: #f6f8fc;
}
.reply span {
  color: #526079;
  font-size: 11px;
  font-weight: 700;
}
.reply p {
  margin: 4px 0 0;
  color: #647084;
  font-size: 12px;
  line-height: 1.65;
  overflow-wrap: anywhere;
}
.empty-state {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #98a1af;
}
.empty-state strong {
  color: #606b7e;
}
.empty-state span {
  font-size: 12px;
}
.pagination {
  justify-content: center;
  margin-top: 22px;
}
@media (max-width: 620px) {
  .message-page {
    padding: 20px 12px 44px;
  }
  .page-heading {
    align-items: flex-start;
    gap: 14px;
    padding: 2px 2px 18px;
  }
  .page-heading h1 {
    font-size: 24px;
  }
  .page-heading p {
    font-size: 13px;
  }
  .page-heading :deep(.el-button) {
    flex: 0 0 auto;
    margin-top: 18px;
    padding-right: 12px;
    padding-left: 12px;
  }
  .message-editor,
  .message-stream {
    padding-right: 14px;
    padding-left: 14px;
  }
  .message-form {
    grid-template-columns: 1fr;
  }
  .content-field,
  .submit-row {
    grid-column: auto;
  }
  .submit-row {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
  }
  .submit-row :deep(.el-button) {
    width: 100%;
  }
  .message-item {
    gap: 10px;
    padding: 16px 0;
  }
  .message-avatar {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
  }
  .message-copy header {
    align-items: flex-start;
    flex-direction: column;
    gap: 2px;
  }
}
</style>
