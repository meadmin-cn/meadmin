<template>
  <page>
    <template #searchForm
      ><me-search-form :model="params" @search="search(1)"
        ><el-form-item :label="t('搜索')"><el-input v-model="params.keyword" clearable /></el-form-item
        ><el-form-item :label="t('状态')"
          ><el-select v-model="params.status" clearable style="width: 160px"><el-option v-for="(label, value) in states" :key="value" :value="value" :label="t(label)" /></el-select></el-form-item></me-search-form
    ></template>
    <me-vxe-table border :loading="loading" :data="data?.list ?? []" :on-add="permission('aon_cms_article_add') ? () => openEditor() : undefined" :pagination-options="{ currentPage: params.page, pageSize: params.pageSize, total: data?.total ?? 0, change: search }" @refresh="search()">
      <vxe-column field="title" :title="t('标题')" min-width="220" />
      <vxe-column field="slug" :title="t('SEO 标识')" min-width="140" />
      <vxe-column field="status" :title="t('状态')" width="120"
        ><template #default="{ row }"
          ><el-tag>{{ t(states[row.status] ?? '') }}</el-tag></template
        ></vxe-column
      >
      <vxe-column field="publishAt" :title="t('发布时间')" min-width="180" />
      <vxe-column field="createdAt" :title="t('创建时间')" min-width="180" />
      <vxe-column :title="t('操作')" fixed="right" min-width="300"
        ><template #default="{ row }">
          <el-button v-if="permission('aon_cms_article_info')" link @click="openEditor(row.id, true)">{{ t('详情') }}</el-button>
          <el-button v-if="permission('aon_cms_article_edit')" link type="primary" @click="openEditor(row.id)">{{ t('编辑') }}</el-button>
          <el-button v-if="[0, 3, 4].includes(row.status) && permission('aon_cms_article_edit')" link :disabled="acting" @click="action(row.id, 'submit')">{{ t('提交审核') }}</el-button>
          <el-button v-if="row.status === 2 && permission('aon_cms_article_review')" link :disabled="acting" @click="action(row.id, 'offline')">{{ t('下线') }}</el-button>
          <template v-if="row.status === 1 && permission('aon_cms_article_review')"
            ><el-button link type="success" :disabled="acting" @click="action(row.id, 'review', true)">{{ t('审核通过') }}</el-button
            ><el-button link type="warning" :disabled="acting" @click="action(row.id, 'review', false)">{{ t('审核拒绝') }}</el-button></template
          >
          <el-popconfirm v-if="permission('aon_cms_article_del')" :title="t('确认删除？')" @confirm="remove(row.id)"
            ><template #reference
              ><el-button link type="danger">{{ t('删除') }}</el-button></template
            ></el-popconfirm
          >
        </template></vxe-column
      >
    </me-vxe-table>
  </page>
</template>
<script setup lang="ts">
import { useActionModel } from '@/hooks';
import { useLocalesI18n } from '@/locales/i18n';
import { permission } from '@/utils/permission';
import { reactive } from 'vue';
import { actionApi, deleteApi, listApi } from '../../api/article';
import Editor from './components/editor.vue';
const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../lang/${locale}.json`), 'cms']);
const states = ['草稿', '待审核', '发布', '拒绝', '下线'];
const params = reactive({ page: 1, pageSize: 20, keyword: '', status: undefined as number | undefined });
const { data, loading, runAsync } = listApi();
const { runAsync: del } = deleteApi();
const search = (page = params.page, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize }));
const { open } = useActionModel(Editor);
const openEditor = (id?: string, readonly = false) => open({ id, readonly, onSuccess: () => search() });
const remove = async (id: string) => {
  await del(id);
  await search(1);
};
const { runAsync: doAction, loading: acting } = actionApi();
const action = async (...args: Parameters<typeof doAction>) => {
  await doAction(...args);
  await search();
};
await Promise.all([loadRes, search()]);
</script>
