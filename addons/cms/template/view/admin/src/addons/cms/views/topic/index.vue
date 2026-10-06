<template>
  <page>
    <template #searchForm
      ><me-search-form :model="params" @search="search(1)"
        ><el-form-item :label="t('搜索')"><el-input v-model="params.keyword" clearable /></el-form-item
        ><el-form-item :label="t('状态')"
          ><el-select v-model="params.status" clearable style="width: 160px"><el-option v-for="(label, value) in states" :key="value" :value="value" :label="t(label)" /></el-select></el-form-item></me-search-form
    ></template>
    <me-vxe-table border :loading="loading" :data="data?.list ?? []" :on-add="permission('aon_cms_topic_add') ? () => openEditor() : undefined" :pagination-options="{ currentPage: params.page, pageSize: params.pageSize, total: data?.total ?? 0, change: search }" @refresh="search()">
      <vxe-column field="title" :title="t('标题')" min-width="220" />
      <vxe-column field="slug" :title="t('SEO 标识')" min-width="140" />
      <vxe-column field="status" :title="t('状态')" width="120"
        ><template #default="{ row }"
          ><el-tag>{{ t(states[row.status] ?? '') }}</el-tag></template
        ></vxe-column
      >
      <vxe-column field="type" :title="t('内容类型')" width="130"
        ><template #default="{ row }"><el-tag :type="row.type === 1 ? 'info' : 'warning'" effect="light" disable-transitions>{{ topicTypeLabel(row.type) }}</el-tag></template></vxe-column
      >
      <vxe-column field="createdAt" :title="t('创建时间')" min-width="180" :formatter="formatterAt" />
      <!-- 前台访问地址：每个专题都有独立前台入口，打开后按后台配置跳转目标 -->
      <vxe-column :title="t('访问地址')" min-width="210" fixed="right"
        ><template #default="{ row }"><AccessUrl :url="cmsTopicUrl(row.slug)" :muted="row.status !== 1" /></template
      ></vxe-column
      >
      <vxe-column :title="t('操作')" fixed="right" min-width="300"
        ><template #default="{ row }">
          <el-button v-if="permission('aon_cms_topic_info')" link @click="openEditor(row.id, true)">{{ t('详情') }}</el-button>
          <el-button v-if="permission('aon_cms_topic_edit')" link type="primary" @click="openEditor(row.id)">{{ t('编辑') }}</el-button>

          <el-button v-if="permission('aon_cms_topic_del')" link type="danger" @click="openConfirm(row)">{{ t('删除') }}</el-button>
        </template></vxe-column
      >
    </me-vxe-table>
    <!-- 删除二次确认：专题被文章引用时会解除关联，删除前先展示关键信息 -->
    <ActionConfirm v-model="confirmVisible" title="删除确认" question="确定要删除这个专题吗？" desc="删除后不可恢复。已归入该专题的文章会变为未归属专题，需要重新设置。" alert-type="error" button-type="danger" confirm-text="确认删除" :items="confirmItems" :loading="confirmActing" @confirm="runConfirm" />
  </page>
</template>
<script setup lang="ts">
import { useActionModel } from '@/hooks';
import { useLocalesI18n } from '@/locales/i18n';
import { formatterAt } from '@/utils/helper.js';
import { permission } from '@/utils/permission';
import { computed, reactive, ref } from 'vue';
import { deleteApi, listApi } from '../../api/topic';
import { cmsTopicUrl } from '../../components/accessUrl';
import AccessUrl from '../../components/accessUrl.vue';
import type { CmsConfirmItem } from '../../components/actionConfirm';
import ActionConfirm from '../../components/actionConfirm.vue';
import Editor from './components/editor.vue';
const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../lang/${locale}.json`), 'cms']);
const states = ['禁用', '启用'];
// 专题内容类型：1内置内容 2外链 3文章 4自定义表单 5目录 6单页
const topicTypes: Array<{ value: number; label: string }> = [
  { value: 1, label: '内置内容' },
  { value: 2, label: '外链' },
  { value: 3, label: '文章' },
  { value: 4, label: '自定义表单' },
  { value: 5, label: '目录' },
  { value: 6, label: '单页' },
];
const topicTypeLabel = (type?: number): string => topicTypes.find((item) => item.value === type)?.label ?? '内置内容';
const params = reactive({ page: 1, pageSize: 20, keyword: '', status: undefined as number | undefined });
const { data, loading, runAsync } = listApi();
const { runAsync: del } = deleteApi();
const search = (page = params.page, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize }));
const { open } = useActionModel(Editor);
const openEditor = (id?: string, readonly = false) => open({ id, readonly, onSuccess: () => search() });
// 删除二次确认
const confirmVisible = ref(false);
const confirmRow = ref<any>();
const confirmActing = ref(false);
const confirmItems = computed<CmsConfirmItem[]>(() => {
  const row = confirmRow.value;
  if (!row) return [];
  return [
    { label: '专题名称', value: row.title },
    { label: 'SEO 标识', value: row.slug },
    { label: '当前状态', value: t(states[row.status] ?? ''), tag: true, tagType: row.status ? 'success' : 'info' },
  ];
});
const openConfirm = (row: any) => {
  confirmRow.value = row;
  confirmVisible.value = true;
};
const runConfirm = async () => {
  const row = confirmRow.value;
  if (!row) return;
  confirmActing.value = true;
  try {
    await del(row.id);
    await search(1);
    confirmVisible.value = false;
  } catch {
    // 失败提示由请求层统一处理，保留弹窗便于确认后重试
  } finally {
    confirmActing.value = false;
  }
};

await Promise.all([loadRes, search()]);
</script>
