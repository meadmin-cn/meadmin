<template>
  <page>
    <template #searchForm
      ><me-search-form :model="params" @search="search(1)"
        ><el-form-item :label="t('搜索')"><el-input v-model="params.keyword" clearable placeholder="标题、摘要" /></el-form-item
        ><el-form-item :label="t('状态')"
          ><el-select v-model="params.status" clearable style="width: 160px"><el-option v-for="(label, value) in states" :key="value" :value="value" :label="t(label)" /></el-select></el-form-item></me-search-form
    ></template>
    <div class="download-page">
      <el-alert class="download-tip" type="info" :closable="false" show-icon title="下载资源由文章统一维护：在「文章」编辑器打开“可下载”并上传关联文件即可，这里只筛选查看，不再单独增删改。" />
      <me-vxe-table border :loading="loading" :data="data?.list ?? []" :pagination-options="{ currentPage: params.page, pageSize: params.pageSize, total: data?.total ?? 0, change: search }" @refresh="search()">
        <vxe-column field="title" :title="t('资源名称')" min-width="240" />
        <vxe-column field="slug" :title="t('SEO 标识')" min-width="140" />
        <vxe-column field="fileName" title="下载文件" min-width="200" show-overflow />
        <vxe-column field="downloads" title="下载次数" width="110" />
        <vxe-column field="status" :title="t('状态')" width="110"
          ><template #default="{ row }"
            ><el-tag :type="row.status === 2 ? 'success' : 'warning'">{{ t(states[row.status] ?? '') }}</el-tag></template
          ></vxe-column
        >
        <vxe-column field="publishAt" :title="t('发布时间')" min-width="180" :formatter="formatterAt" />
        <vxe-column field="createdAt" :title="t('创建时间')" min-width="180" :formatter="formatterAt" />
        <vxe-column :title="t('操作')" fixed="right" min-width="160"
          ><template #default="{ row }">
            <el-button v-if="permission('aon_cms_article_info')" link @click="openDetail(row.id)">{{ t('详情') }}</el-button>
            <el-button v-if="permission('aon_cms_article_edit')" link type="primary" @click="openEditor(row.id)">{{ t('编辑') }}</el-button>
          </template></vxe-column
        >
      </me-vxe-table>
    </div>
    <Detail :id="detailId" v-model="detailVisible" @closed="search()" />
  </page>
</template>
<script setup lang="ts">
import { useActionModel } from '@/hooks';
import { useLocalesI18n } from '@/locales/i18n';
import { formatterAt } from '@/utils/helper.js';
import { permission } from '@/utils/permission';
import { reactive, ref } from 'vue';
import { listApi } from '../../api/article';
import Detail from '../article/components/detail.vue';
import Editor from '../article/components/editor.vue';
const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../lang/${locale}.json`), 'cms']);
const states = ['草稿', '待审核', '发布', '拒绝', '下线'];
const params = reactive({ page: 1, pageSize: 20, keyword: '', status: undefined as number | undefined });
const { data, loading, runAsync } = listApi();
// 只查询支持下载的文章，复用文章接口，不再单独维护下载资源表。
const search = (page = params.page, pageSize = params.pageSize) => runAsync(Object.assign(params, { page, pageSize, isDownload: true }));
const { open } = useActionModel(Editor);
const openEditor = (id: string) => open({ id, onSuccess: () => search() });
const detailVisible = ref(false);
const detailId = ref<string>();
const openDetail = (id: string) => {
  detailId.value = id;
  detailVisible.value = true;
};
await Promise.all([loadRes, search()]);
</script>
<style scoped>
.download-page {
  min-width: 0;
}
.download-tip {
  margin-bottom: 4px;
  border-radius: 8px;
}
</style>
