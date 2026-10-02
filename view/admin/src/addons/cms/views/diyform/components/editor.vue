<template>
  <me-dialog v-model="show" :title="t(readonly ? '详情' : id ? '编辑' : '新增')" :close-on-click-modal="false" class="diyform-editor-dialog" @closed="emit('closed')">
    <el-form ref="formEl" :model="form" :rules="rules" :disabled="readonly || loading" label-position="top">
      <section class="editor-section">
        <h4 class="editor-section-title">基础信息</h4>
        <div class="form-grid">
          <el-form-item :label="t('表单名称')" prop="title"><el-input v-model="form.title" placeholder="例如：留言板" /></el-form-item>
          <el-form-item :label="t('表单标识')" prop="diyname"><el-input v-model="form.diyname" placeholder="英文短横线标识，例如 message" /></el-form-item>
        </div>
        <el-form-item :label="t('说明')" prop="description"><el-input v-model="form.description" maxlength="500" placeholder="说明该表单的用途，前台展示在标题下方" /></el-form-item>
        <div class="form-grid">
          <el-form-item :label="t('提交按钮文案')" prop="submitText"><el-input v-model="form.submitText" maxlength="60" placeholder="例如：提交留言" /></el-form-item>
          <el-form-item :label="t('排序')" prop="orderNum"><el-input-number :key="String(readonly || loading)" v-model="form.orderNum" :min="-9999" :max="9999" /></el-form-item>
        </div>
        <div class="form-grid">
          <el-form-item :label="t('状态')" prop="status"
            ><el-select v-model="form.status"><el-option :value="1" :label="t('启用')" /><el-option :value="0" :label="t('禁用')" /></el-select
          ></el-form-item>
          <el-form-item :label="t('提交后')" prop="needReview"
            ><el-select v-model="form.needReview"><el-option :value="1" :label="t('需审核后展示')" /><el-option :value="0" :label="t('直接通过')" /></el-select
          ></el-form-item>
        </div>
        <el-form-item label="前台留言板" prop="isMessageBoard">
          <el-switch v-model="form.isMessageBoard" active-text="作为前台留言板表单" inactive-text="普通表单" />
          <el-alert class="field-tip" title="前台留言板页面会读取该表单的字段并渲染；整个站点只允许一个表单作为留言板。" type="info" :closable="false" />
        </el-form-item>
      </section>

      <section class="editor-section">
        <div class="section-head">
          <h4 class="editor-section-title">表单字段</h4>
          <el-button v-if="!readonly" type="primary" plain size="small" @click="addField">添加字段</el-button>
        </div>
        <el-alert class="field-tip" title="字段名用于存储（英文），字段标签展示给访客；前台按下方顺序渲染表单。" type="info" :closable="false" />
        <div v-if="fields.length" class="field-list">
          <div v-for="(field, index) in fields" :key="index" class="field-item">
            <div class="field-item-head">
              <span class="field-index">{{ index + 1 }}</span>
              <div class="field-item-actions">
                <el-button link :disabled="index === 0 || readonly" @click="moveField(index, -1)">上移</el-button>
                <el-button link :disabled="index === fields.length - 1 || readonly" @click="moveField(index, 1)">下移</el-button>
                <el-button v-if="!readonly" link type="danger" @click="fields.splice(index, 1)">删除</el-button>
              </div>
            </div>
            <div class="form-grid">
              <el-form-item label="字段名"><el-input v-model="field.name" placeholder="英文，例如 content" /></el-form-item>
              <el-form-item label="字段标签"><el-input v-model="field.label" placeholder="展示给访客，例如 留言内容" /></el-form-item>
              <el-form-item label="字段类型">
                <el-select v-model="field.type">
                  <el-option v-for="item in cmsDiyformFieldTypes" :key="item.value" :value="item.value" :label="item.label" />
                </el-select>
              </el-form-item>
              <el-form-item label="必填"><el-switch v-model="field.required" /></el-form-item>
            </div>
            <div class="form-grid">
              <el-form-item label="提示文案"><el-input v-model="field.placeholder" placeholder="输入框占位提示" /></el-form-item>
              <el-form-item label="最大长度"><el-input-number v-model="field.maxlength" :min="0" :max="20000" controls-position="right" /></el-form-item>
            </div>
            <el-form-item v-if="['select', 'radio', 'checkbox'].includes(field.type)" label="选项（每行一个）">
              <el-input
                :model-value="(field.options ?? []).join('\n')"
                type="textarea"
                :rows="3"
                placeholder="选项一&#10;选项二"
                @update:model-value="
                  (value: string) =>
                    (field.options = value
                      .split('\n')
                      .map((item) => item.trim())
                      .filter(Boolean))
                "
              />
            </el-form-item>
            <el-form-item label="作为联系方式">
              <el-switch v-model="field.contact" />
              <span class="field-hint">开启后该字段会抽取到数据列表的「联系方式」列，仅管理员可见。</span>
            </el-form-item>
          </div>
        </div>
        <el-empty v-else description="尚未配置字段，请先添加" />
      </section>
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
import { ElMessage } from 'element-plus';
import { reactive, ref, watch } from 'vue';
import type { CmsDiyformField } from '../../../api/diyform';
import { cmsDiyformFieldTypes, defaults, infoApi, parseFields, saveApi } from '../../../api/diyform';

const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../../lang/${locale}.json`), 'cms']);
const props = defineProps<{ id?: string; readonly?: boolean }>();
const emit = defineEmits<{ success: []; closed: [] }>();
const show = defineModel<boolean>();
const form = reactive(defaults());
const fields = ref<CmsDiyformField[]>([]);
const formEl = ref<FormInstance>();
const { runAsync: getInfo, loading } = infoApi();
const { runAsync: saveInfo, loading: saving } = saveApi();

const rules: FormRules = {
  title: [{ required: true, message: t('必填'), trigger: 'blur' }],
  diyname: [{ required: true, message: t('必填'), trigger: 'blur' }],
};
const addField = () => fields.value.push({ name: '', label: '', type: 'text', required: false, placeholder: '', maxlength: 200 });
const moveField = (index: number, offset: number) => {
  const target = index + offset;
  if (target < 0 || target >= fields.value.length) return;
  const list = [...fields.value];
  [list[index], list[target]] = [list[target], list[index]];
  fields.value = list;
};
const save = async () => {
  if (!(await formEl.value?.validate().catch(() => false))) return;
  if (!fields.value.length) {
    ElMessage.warning('请至少添加一个表单字段');
    return;
  }
  const names = new Set<string>();
  for (const [index, field] of fields.value.entries()) {
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(field.name ?? '')) {
      ElMessage.warning(`第 ${index + 1} 个字段的字段名只能包含字母、数字与下划线，且以字母开头`);
      return;
    }
    if (!field.label?.trim()) {
      ElMessage.warning(`请填写第 ${index + 1} 个字段的字段标签`);
      return;
    }
    if (names.has(field.name)) {
      ElMessage.warning(`字段名 ${field.name} 重复`);
      return;
    }
    names.add(field.name);
  }
  await saveInfo(props.id, { ...form, fields: JSON.stringify(fields.value) });
  show.value = false;
  emit('success');
};
// 不要在 setup 里 await 语言包：顶层 await 会让组件变成异步组件，未用 Suspense 包裹时弹窗内容失去响应式更新
void loadRes;
watch(
  () => props.id,
  async (id) => {
    Object.assign(form, defaults());
    fields.value = [];
    if (id) {
      const data = await getInfo(id);
      for (const key of Object.keys(form) as Array<keyof typeof form>) Object.assign(form, { [key]: data[key] });
      fields.value = parseFields(data.fields);
      if (!fields.value.length) addField();
    } else {
      addField();
    }
  },
  { immediate: true },
);
</script>
<style scoped>
.diyform-editor-dialog :deep(.el-dialog) {
  max-width: 760px;
}
.editor-section {
  margin-bottom: 18px;
}
.editor-section-title {
  margin: 0;
  color: #1f2733;
  font-size: 15px;
  font-weight: 700;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}
.field-tip {
  margin-bottom: 12px;
}
.field-hint {
  display: block;
  margin-top: 6px;
  color: #98a1af;
  font-size: 12px;
  line-height: 1.6;
}
.field-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.field-item {
  padding: 14px 16px 4px;
  border: 1px solid #e6eaf2;
  border-radius: 10px;
  background: #fbfcfe;
}
.field-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.field-index {
  display: inline-grid;
  width: 22px;
  height: 22px;
  place-items: center;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  background: #2b5cff;
  border-radius: 50%;
}
.field-item-actions :deep(.el-button) {
  margin-left: 8px;
}
@media (max-width: 680px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
