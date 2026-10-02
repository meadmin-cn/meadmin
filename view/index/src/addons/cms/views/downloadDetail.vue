<template>
  <section class="download-detail-page">
    <div v-loading="loading" class="download-detail-shell">
      <el-alert v-if="failed" title="资源加载失败" type="error" :closable="false"><el-button @click="load">重试</el-button></el-alert>
      <template v-else-if="detail">
        <nav class="detail-breadcrumb" aria-label="面包屑">
          <RouterLink to="/aon/cms">首页</RouterLink><span>/</span><RouterLink to="/aon/cms/download">下载中心</RouterLink><span>/</span><strong>{{ detail.title }}</strong>
        </nav>
        <article class="download-article">
          <header class="download-article-header">
            <div class="download-heading">
              <span class="download-kicker">{{ detail.category || '资源下载' }}</span>
              <h1>{{ detail.title }}</h1>
              <div class="download-meta">
                <span v-if="detail.version">版本 {{ detail.version }}</span
                ><span>{{ detail.downloads ?? 0 }} 次下载</span>
              </div>
            </div>
            <el-button class="detail-download-button" type="primary" size="large" @click="confirmDownload"
              ><el-icon><Download /></el-icon>下载资源</el-button
            >
          </header>
          <img v-if="safeUrl(detail.coverUrl)" class="download-detail-cover" :src="detail.coverUrl" :alt="detail.title" />
          <p v-if="detail.summary" class="download-summary">{{ detail.summary }}</p>
          <div class="download-content-body"><CmsPreview :content="detail.mdContent || detail.summary || '暂无详细介绍'" /></div>
        </article>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Download } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import type { CmsDownload } from '../api/cms';
import { downloadApi, downloadInfoApi } from '../api/cms';
import CmsPreview from '../components/cmsPreview.vue';

const route = useRoute();
const detail = ref<CmsDownload>();
const loading = ref(false);
const failed = ref(false);
const { runAsync: getDetail } = downloadInfoApi();
const { runAsync: download } = downloadApi();
const safeUrl = (url?: string) => (url && /^(https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/.test(url) ? url : undefined);
const load = async () => {
  loading.value = true;
  failed.value = false;
  try {
    detail.value = await getDetail(String(route.params.slug ?? ''));
    if (!detail.value?.id) failed.value = true;
    document.title = detail.value?.title || '下载详情';
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
};
const confirmDownload = async () => {
  if (!detail.value) return;
  try {
    await ElMessageBox.confirm(`确认下载“${detail.value.title}”吗？`, '确认下载', { confirmButtonText: '确认下载', cancelButtonText: '取消', type: 'info' });
    const result = await download(detail.value.slug);
    if (!result.url) return ElMessage.warning('资源暂未配置下载地址');
    window.open(result.url, '_blank', 'noopener,noreferrer');
    detail.value.downloads = result.downloads ?? detail.value.downloads + 1;
    ElMessage.success('已开始下载');
  } catch {
    // 用户取消下载时不提示错误。
  }
};

await load();
</script>

<style scoped>
.download-detail-page {
  min-height: 100%;
  padding: 28px 20px 64px;
  background: #f5f7fb;
}
.download-detail-shell {
  width: min(100%, 940px);
  margin: 0 auto;
}
.detail-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #9aa3b1;
  font-size: 12px;
}
.detail-breadcrumb a {
  color: #59677d;
  text-decoration: none;
}
.detail-breadcrumb a:hover {
  color: #181c28;
}
.download-article {
  padding: 36px;
  background: #fff;
  border: 1px solid #e7ebf2;
  border-radius: 12px;
  box-shadow: 0 8px 26px rgba(30, 48, 90, 0.045);
}
.download-article-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}
.download-heading {
  min-width: 0;
}
.download-kicker {
  display: inline-block;
  margin-bottom: 8px;
  padding: 4px 9px;
  color: #202b3d;
  font-size: 11px;
  background: #eef1f5;
  border-radius: 4px;
}
.download-heading h1 {
  margin: 0 0 12px;
  color: #202b3d;
  font-size: 34px;
  line-height: 1.35;
}
.download-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: #929baa;
  font-size: 13px;
}
.detail-download-button {
  flex: 0 0 auto;
}
.download-detail-cover {
  display: block;
  width: 100%;
  max-height: 480px;
  object-fit: cover;
  border-radius: 8px;
}
.download-summary {
  margin: 24px 0;
  padding: 18px 20px;
  color: #5b6678;
  line-height: 1.8;
  border-left: 3px solid #202b3d;
  background: #f7f9fc;
}
.download-content-body {
  color: #39465d;
  line-height: 1.8;
}
@media (max-width: 640px) {
  .download-detail-page {
    padding: 16px 12px 44px;
  }
  .download-article {
    padding: 22px 18px;
  }
  .download-article-header {
    display: block;
  }
  .download-heading h1 {
    font-size: 26px;
  }
  .detail-download-button {
    width: 100%;
    margin-top: 18px;
  }
}
</style>
