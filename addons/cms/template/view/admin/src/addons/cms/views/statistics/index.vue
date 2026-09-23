<template>
  <page>
    <el-button :loading="loading" @click="runAsync()">{{ t('刷新') }}</el-button>
    <div class="cms-counts">
      <el-card v-for="(count, key) in data?.counts" :key="key" shadow="never"
        ><div>{{ t(labels[key] ?? key) }}</div>
        <strong>{{ count }}</strong></el-card
      >
    </div>
    <h3>{{ t('近14天新增（UTC）') }}</h3>
    <me-vxe-table :data="data?.trends ?? []" :loading="loading" border @refresh="runAsync()"><vxe-column field="date" :title="t('日期')" /><vxe-column field="articles" :title="t('文章')" /><vxe-column field="comments" :title="t('评论')" /></me-vxe-table>
  </page>
</template>
<script setup lang="ts">
import { useLocalesI18n } from '@/locales/i18n';
import request from '@/utils/request';
const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../../lang/${locale}.json`), 'cms']);
const labels: Record<string, string> = { article: '文章', category: '栏目', tag: '标签', topic: '专题', page: '单页', block: '区块', comment: '评论', pendingArticles: '待审核文章', pendingComments: '待审核评论', published: '已到发布时间', scheduled: '定时发布' };
const { data, loading, runAsync } = request<{ counts: Record<string, number>; trends: Array<{ date: string; articles: number; comments: number }> }, []>(() => ({ url: 'addons/cms/statistics/', method: 'get' }), { noLoading: true });
await Promise.all([loadRes, runAsync()]);
</script>
<style scoped>
.cms-counts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin: 20px 0;
}
.cms-counts strong {
  display: block;
  font-size: 30px;
  color: var(--el-color-primary);
  margin-top: 12px;
}
</style>
