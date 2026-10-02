<template>
  <page>
    <me-vxe-table border :loading="loading" :data="data ?? []" :tree-config="{ rowField: 'id', childrenField: 'children', expandAll: true }" :on-add="permission('aon_cms_category_add') ? () => openEditor() : undefined" @refresh="search()">
      <vxe-column field="title" tree-node :title="t('栏目')" min-width="220" />
      <vxe-column field="slug" :title="t('SEO 标识')" />
      <vxe-column field="type" :title="t('类型')" width="100"
        ><template #default="{ row }"
          ><el-tag :type="row.type === 3 ? 'warning' : row.type === 2 ? 'info' : 'success'" disable-transitions>{{ cmsCategoryTypeLabel(row.type) }}</el-tag></template
        ></vxe-column
      >
      <vxe-column field="isNav" :title="t('导航')" width="80"
        ><template #default="{ row }">{{ t(row.isNav === false ? '否' : '是') }}</template></vxe-column
      >
      <vxe-column field="orderNum" :title="t('排序')" />
      <vxe-column field="status" :title="t('状态')"
        ><template #default="{ row }">{{ t(row.status ? '启用' : '禁用') }}</template></vxe-column
      >
      <!-- 前台访问地址：跳转链接型栏目直接展示外链，其余为栏目列表页 -->
      <vxe-column :title="t('访问地址')" min-width="230"
        ><template #default="{ row }"><AccessUrl :url="cmsCategoryUrl(row)" :muted="!row.status" /></template
      ></vxe-column>
      <vxe-column :title="t('操作')" min-width="200"
        ><template #default="{ row }">
          <el-button v-if="permission('aon_cms_category_info')" link @click="openEditor(row.id, true)">{{ t('详情') }}</el-button>
          <el-button v-if="permission('aon_cms_category_edit')" link @click="openEditor(row.id)">{{ t('编辑') }}</el-button>
          <el-button v-if="permission('aon_cms_category_del')" link type="danger" @click="openConfirm(row)">{{ t('删除') }}</el-button>
        </template></vxe-column
      >
    </me-vxe-table>
    <!-- 删除二次确认：栏目可能承载文章与子栏目，删除前先展示关键信息 -->
    <ActionConfirm v-model="confirmVisible" title="删除确认" question="确定要删除这个栏目吗？" desc="删除后不可恢复。若该栏目下仍有子栏目或已关联文章，需先迁移或删除后再操作。" alert-type="error" button-type="danger" confirm-text="确认删除" :items="confirmItems" :loading="confirmActing" @confirm="runConfirm" />
  </page>
</template>
<script setup lang="ts">
import { useActionModel } from '@/hooks';
import { useLocalesI18n } from '@/locales/i18n';
import { permission } from '@/utils/permission';
import { computed, ref } from 'vue';
import { cmsCategoryTypeLabel, deleteApi, treeApi } from '../../api/category';
import { cmsCategoryUrl } from '../../components/accessUrl';
import AccessUrl from '../../components/accessUrl.vue';
import type { CmsConfirmItem } from '../../components/actionConfirm';
import ActionConfirm from '../../components/actionConfirm.vue';
import Editor from './components/editor.vue';
const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../lang/${locale}.json`), 'cms']);
const { data, loading, runAsync: search } = treeApi();
const { runAsync: del } = deleteApi();
const { open } = useActionModel(Editor);
const openEditor = (id?: string, readonly = false) => open({ id, readonly, onSuccess: () => search() });
const confirmVisible = ref(false);
const confirmRow = ref<any>();
const confirmActing = ref(false);
const confirmItems = computed<CmsConfirmItem[]>(() => {
  const row = confirmRow.value;
  if (!row) return [];
  return [
    { label: '栏目名称', value: row.title },
    { label: 'SEO 标识', value: row.slug },
    { label: '排序', value: row.orderNum ?? 0 },
    { label: '当前状态', value: t(row.status ? '启用' : '禁用'), tag: true, tagType: row.status ? 'success' : 'info' },
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
    await search();
    confirmVisible.value = false;
  } catch {
    // 失败提示由请求层统一处理，保留弹窗便于确认后重试
  } finally {
    confirmActing.value = false;
  }
};
await Promise.all([loadRes, search()]);
</script>
