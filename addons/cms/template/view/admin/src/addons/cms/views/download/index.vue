<template>
  <page>
    <template #searchForm><me-search-form :model="params" @search="search(1)"><el-form-item label="搜索"><el-input v-model="params.keyword" clearable placeholder="标题、简介、栏目" /></el-form-item><el-form-item label="状态"><el-select v-model="params.status" clearable style="width: 140px"><el-option :value="1" label="展示" /><el-option :value="0" label="隐藏" /></el-select></el-form-item></me-search-form></template>
    <me-vxe-table border :loading="loading" :data="data?.list ?? []" :on-add="permission('aon_cms_download_add') ? () => openEditor() : undefined" :pagination-options="{ currentPage: params.page, pageSize: params.pageSize, total: data?.total ?? 0, change: search }" @refresh="search()">
      <vxe-column field="title" title="资源名称" min-width="220" />
      <vxe-column field="category" title="栏目" width="130" />
      <vxe-column field="version" title="版本" width="100" />
      <vxe-column field="downloads" title="下载次数" width="110" />
      <vxe-column field="status" title="状态" width="100"><template #default="{ row }"><el-tag :type="row.status ? 'success' : 'info'">{{ row.status ? '展示' : '隐藏' }}</el-tag></template></vxe-column>
      <vxe-column field="createdAt" title="创建时间" min-width="180" />
      <vxe-column title="操作" fixed="right" min-width="220"><template #default="{ row }"><el-button v-if="permission('aon_cms_download_info')" link @click="openEditor(row.id, true)">详情</el-button><el-button v-if="permission('aon_cms_download_edit')" link type="primary" @click="openEditor(row.id)">编辑</el-button><el-popconfirm v-if="permission('aon_cms_download_del')" title="确认删除？" @confirm="remove(row.id)"><template #reference><el-button link type="danger">删除</el-button></template></el-popconfirm></template></vxe-column>
    </me-vxe-table>
  </page>
</template>
<script setup lang="ts">
import { useActionModel } from '@/hooks';
import { permission } from '@/utils/permission';
import { reactive } from 'vue';
import { deleteApi, listApi } from '../../api/download';
import Editor from './components/editor.vue';
const params = reactive({ page: 1, pageSize: 20, keyword: '', status: undefined as number | undefined });
const { data, loading, runAsync } = listApi();
const { runAsync: del } = deleteApi();
const search = (page = params.page, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize }));
const { open } = useActionModel(Editor);
const openEditor = (id?: string, readonly = false) => open({ id, readonly, onSuccess: () => search() });
const remove = async (id: string) => { await del(id); await search(1); };
await search();
</script>
