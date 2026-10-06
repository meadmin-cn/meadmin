<template>
  <me-dialog v-model="show" :title="t(readonly ? '详情' : id ? '编辑' : '新增')" :close-on-click-modal="false" @closed="emit('closed')">
    <el-form ref="formEl" :model="form" :rules="rules" :disabled="readonly || loading" label-position="top">
      <el-form-item :label="t('名称')" prop="title"><el-input v-model="form.title" /></el-form-item>
      <el-form-item :label="t('SEO 标识')" prop="slug"><el-input v-model="form.slug" /></el-form-item>
      <el-form-item :label="t('栏目类型')" prop="type">
        <el-select v-model="form.type">
          <el-option v-for="item in cmsCategoryTypes" :key="item.value" :value="item.value" :label="item.label" />
        </el-select>
      </el-form-item>
      <el-alert class="field-tip" :title="typeDesc" type="info" :closable="false" />
      <el-form-item v-if="form.type === 3" :label="t('跳转链接')" prop="linkUrl">
        <el-input v-model="form.linkUrl" maxlength="1000" placeholder="站内路径（如 /aon/cms/download）或完整网址（如 https://www.meadmin.cn）" />
      </el-form-item>
      <el-form-item v-else-if="form.type === 4" :label="t('选择表单')" prop="target">
        <el-select v-model="form.target" filterable placeholder="选择自定义表单">
          <el-option v-for="f in diyforms ?? []" :key="f.id" :value="f.id" :label="f.title" />
        </el-select>
      </el-form-item>
      <el-form-item v-else-if="form.type === 5" :label="t('选择单页')" prop="target">
        <el-select v-model="form.target" filterable placeholder="选择单页">
          <el-option v-for="p in pages ?? []" :key="p.id" :value="p.id" :label="p.title" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('状态')" prop="status"
        ><el-select v-model="form.status"><el-option :value="0" :label="t('禁用')" /><el-option :value="1" :label="t('启用')" /></el-select
      ></el-form-item>
      <el-form-item :label="t('排序')" prop="orderNum"><el-input-number :key="String(readonly || loading)" v-model="form.orderNum" :min="-9999" :max="9999" /></el-form-item>
      <el-form-item :label="t('父级')" prop="parentId"><el-tree-select v-model="form.parentId" :data="treeData ?? []" :props="{ label: 'title' }" node-key="id" check-strictly clearable /></el-form-item>
      <el-form-item label="导航显示" prop="isNav"><el-switch v-model="form.isNav" active-text="显示在前台头部菜单" inactive-text="不在头部显示" /></el-form-item>
      <el-alert class="field-tip" title="前台头部菜单完全由栏目驱动，关闭后该栏目及其子栏目都不会出现在头部导航中。" type="info" :closable="false" />
      <el-form-item label="推荐栏目" prop="isRecommend"><el-switch v-model="form.isRecommend" active-text="展示在首页栏目推荐" inactive-text="普通栏目" /></el-form-item>
      <el-form-item label="封面" prop="coverUrl">
        <!-- 图片统一由上传按钮产生，上传后可即时预览 -->
        <me-upload accept=".png,.jpg,.jpeg,.webp" :limit="1" list-type="picture" :model-value="uploadValue(form.coverUrl)" @update:model-value="(files) => (form.coverUrl = files[0]?.url ?? '')" />
        <el-alert class="field-tip" title="建议上传 1200×800（3:2）图片，单张体积不超过 500MB" type="info" :closable="false" />
      </el-form-item>
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
import { cmsCategoryTypes, defaults, infoApi, saveApi, treeApi } from '../../../api/category';
import { listApi as diyformListApi } from '../../../api/diyform';
import { listApi as pageListApi } from '../../../api/page';

const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../../lang/${locale}.json`), 'cms']);
const props = defineProps<{ id?: string; readonly?: boolean }>();
const emit = defineEmits<{ success: []; closed: [] }>();
const show = defineModel<boolean>();
const form = reactive(defaults());
const formEl = ref<FormInstance>();
const { runAsync: getInfo, loading } = infoApi();
const { runAsync: saveInfo, loading: saving } = saveApi();
const { runAsync: getTree, data: treeData } = treeApi();
const { runAsync: loadDiyforms, data: diyforms } = diyformListApi();
const { runAsync: loadPages, data: pages } = pageListApi();
// 类型说明随选择变化，帮助运营理解每种类型在前台的表现
const typeDesc = computed(() => cmsCategoryTypes.find((item) => item.value === form.type)?.desc ?? '');
// el-upload 通过 TransitionGroup 渲染列表，key 取 uid || name，回显文件必须带上唯一 uid 才会渲染
let uploadUid = 0;
const uploadValue = (url: unknown): FileInfo[] => (typeof url === 'string' && url ? ([{ uid: -++uploadUid, url, name: url.split('/').pop() ?? 'image' }] as unknown as FileInfo[]) : []);
const rules = computed<FormRules>(() => ({
  title: [{ required: true, message: t('必填'), trigger: 'blur' }],
  slug: [{ required: true, message: t('必填'), trigger: 'blur' }],
  ...(form.type === 3 ? { linkUrl: [{ required: true, message: t('必填'), trigger: 'blur' }] } : {}),
  ...(form.type === 4 || form.type === 5 ? { target: [{ required: true, message: t('必选'), trigger: 'change' }] } : {}),
}));
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
    await Promise.all([getTree(), loadDiyforms({ page: 1, pageSize: 1000, status: 1 }), loadPages({ page: 1, pageSize: 1000, status: 2 })]);
  },
  { immediate: true },
);
</script>
<style lang="scss" scoped>
.field-tip {
  margin-bottom: 18px;
}
</style>
