<template>
  <page>
    <template #searchForm
      ><me-search-form :model="params" @search="search(1)"
        ><el-form-item :label="t('搜索')"><el-input v-model="params.keyword" clearable /></el-form-item
        ><el-form-item :label="t('状态')"
          ><el-select v-model="params.status" clearable style="width: 160px"><el-option :value="1" :label="t('启用')" /><el-option :value="0" :label="t('禁用')" /></el-select></el-form-item></me-search-form
    ></template>
    <!-- 左侧栏目树：表单只能挂在「自定义表单」型栏目下，其余类型的栏目置灰不可选（与文章列表同一套交互） -->
    <CategoryWorkspace :categories="categories ?? []" :allow-types="cmsCategoryLinkableTypes.diyform" :current="params.categoryId ?? undefined" @select="selectCategory">
      <me-vxe-table border :loading="loading" :data="data?.list ?? []" :on-add="permission('aon_cms_diyform_add') ? () => openEditor() : undefined" :pagination-options="{ currentPage: params.page, pageSize: params.pageSize, total: data?.total ?? 0, change: search }" @refresh="search()">
        <vxe-column field="title" :title="t('表单名称')" min-width="160" />
        <vxe-column field="diyname" :title="t('表单标识')" min-width="140" />
        <vxe-column field="categoryTitle" :title="t('关联栏目')" min-width="140"
          ><template #default="{ row }"><span v-if="row.categoryTitle">{{ row.categoryTitle }}</span><span v-else class="muted-text">{{ t('未关联') }}</span></template
        ></vxe-column>
        <vxe-column field="fields" :title="t('字段')" min-width="120"
          ><template #default="{ row }">{{ parseFields(row.fields).length }} 个</template></vxe-column
        >
        <vxe-column field="dataCount" :title="t('提交数据')" width="110"
          ><template #default="{ row }"
            ><span class="data-link" @click="openData(row)">{{ row.dataCount ?? 0 }} 条</span></template
          ></vxe-column
        >
        <vxe-column field="isMessageBoard" :title="t('留言板')" width="100"
          ><template #default="{ row }"><el-tag v-if="row.isMessageBoard" type="success" disable-transitions>使用中</el-tag><span v-else>-</span></template></vxe-column
        >
        <vxe-column field="status" :title="t('状态')" width="100"
          ><template #default="{ row }"
            ><el-tag :type="row.status ? 'success' : 'info'" disable-transitions>{{ t(row.status ? '启用' : '禁用') }}</el-tag></template
          ></vxe-column
        >
        <vxe-column field="createdAt" :title="t('创建时间')" min-width="180" :formatter="formatterAt" />
        <!-- 前台访问地址：每个自定义表单均由关联栏目解析为独立前台页 -->
        <vxe-column :title="t('访问地址')" min-width="230" fixed="right"
          ><template #default="{ row }"><AccessUrl :url="cmsDiyformUrl(row.diyname)" :muted="!row.status" /></template
        ></vxe-column>
        <vxe-column :title="t('操作')" fixed="right" min-width="260"
          ><template #default="{ row }">
            <el-button v-if="permission('aon_cms_diyform_info')" link @click="openEditor(row.id, true)">{{ t('详情') }}</el-button>
            <el-button v-if="permission('aon_cms_diyform_edit')" link type="primary" @click="openEditor(row.id)">{{ t('编辑') }}</el-button>
            <el-button v-if="permission('aon_cms_diyform_data_list')" link @click="openData(row)">{{ t('查看数据') }}</el-button>
            <el-button v-if="permission('aon_cms_diyform_del')" link type="danger" @click="openConfirm(row)">{{ t('删除') }}</el-button>
          </template></vxe-column
        >
      </me-vxe-table>
    </CategoryWorkspace>
    <ActionConfirm v-model="confirmVisible" title="删除确认" question="确定要删除这个表单吗？" desc="删除后不可恢复。表单下若仍有提交数据需先清空，前台留言板使用的表单不可删除。" alert-type="error" button-type="danger" confirm-text="确认删除" :items="confirmItems" :loading="confirmActing" @confirm="runConfirm" />
    <DataDialog v-model="dataVisible" :form="activeForm" />
  </page>
</template>
<script setup lang="ts">
import { useActionModel } from '@/hooks';
import { useLocalesI18n } from '@/locales/i18n';
import { formatterAt } from '@/utils/helper.js';
import { permission } from '@/utils/permission';
import { computed, reactive, ref } from 'vue';
import { treeApi } from '../../api/category';
import { deleteApi, listApi, parseFields } from '../../api/diyform';
import { cmsDiyformUrl } from '../../components/accessUrl';
import AccessUrl from '../../components/accessUrl.vue';
import type { CmsConfirmItem } from '../../components/actionConfirm';
import ActionConfirm from '../../components/actionConfirm.vue';
import { cmsCategoryLinkableTypes } from '../../components/categoryTree';
import CategoryWorkspace from '../../components/categoryWorkspace.vue';
import Editor from './components/editor.vue';
import DataDialog from './components/dataDialog.vue';

const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../lang/${locale}.json`), 'cms']);
const params = reactive({ page: 1, pageSize: 20, keyword: '', status: undefined as number | undefined, categoryId: undefined as string | undefined });
const { data, loading, runAsync } = listApi();
const { data: categories, runAsync: loadCategories } = treeApi();
const { runAsync: del } = deleteApi();
const search = (page = params.page, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize }));
// 左侧栏目树：点击栏目后按 categoryId 过滤，点「全部」恢复完整列表
const selectCategory = (categoryId?: string) => {
  params.categoryId = categoryId;
  search(1);
};
const { open } = useActionModel(Editor);
const openEditor = (id?: string, readonly = false) => open({ id, readonly, onSuccess: () => search() });
// 查看数据：弹出对话框展示该表单的提交数据，而非跳转到独立页面
const dataVisible = ref(false);
const activeForm = ref<any>();
const openData = (row: any) => {
  activeForm.value = row;
  dataVisible.value = true;
};
const confirmVisible = ref(false);
const confirmRow = ref<any>();
const confirmActing = ref(false);
const confirmItems = computed<CmsConfirmItem[]>(() => {
  const row = confirmRow.value;
  if (!row) return [];
  return [
    { label: '表单名称', value: row.title },
    { label: '表单标识', value: row.diyname },
    { label: '关联栏目', value: row.categoryTitle || '未关联' },
    { label: '字段数量', value: `${parseFields(row.fields).length} 个` },
    { label: '提交数据', value: `${row.dataCount ?? 0} 条` },
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
await Promise.all([loadRes, loadCategories(), search()]);
</script>
<style scoped>
.muted-text {
  color: var(--el-text-color-placeholder);
}
.data-link {
  color: #2b5cff;
  cursor: pointer;
}
.data-link:hover {
  text-decoration: underline;
}
</style>
