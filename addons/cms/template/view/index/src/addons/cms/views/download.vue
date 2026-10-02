<template>
  <section class="download-page">
    <div class="download-shell">
      <header class="page-heading">
        <h1>下载中心</h1>
        <nav aria-label="面包屑"><RouterLink to="/aon/cms">首页</RouterLink><span>/</span><span>下载中心</span></nav>
      </header>

      <div class="download-toolbar">
        <div class="toolbar-text">
          <span class="toolbar-kicker">RESOURCE LIBRARY</span>
          <h2>下载资源</h2>
          <p>按标题、介绍搜索，点击进入详情即可下载。</p>
        </div>
        <el-input v-model="keyword" class="download-search" clearable placeholder="搜索下载内容" @keyup.enter="search" @clear="search">
          <template #prefix><el-icon><Search /></el-icon></template>
          <template #append><el-button type="primary" @click="search">搜索</el-button></template>
        </el-input>
      </div>

      <div v-loading="loading" class="download-content">
        <template v-if="hasItems">
          <section v-for="group in groupedDownloads" :key="group.name" class="category-section">
            <header class="section-heading">
              <div><h2>{{ group.name }}</h2><span>已展示 {{ group.items.length }} 项</span></div>
              <el-button link type="primary" :loading="group.loading" :disabled="!group.hasMore" @click="loadMore(group)">{{ group.hasMore ? '展开更多' : '已加载全部' }}<el-icon v-if="group.hasMore"><ArrowDown /></el-icon></el-button>
            </header>
            <ul class="resource-list">
              <li v-for="item in group.items" :key="item.id" class="resource-row" tabindex="0" @click="openDetail(item)" @keyup.enter="openDetail(item)">
                <span class="resource-thumb">
                  <img v-if="hasCover(item)" :src="item.coverUrl" :alt="item.title" loading="lazy" @error="markCoverFailed(item.id)" />
                  <span v-else class="cover-fallback">{{ item.title.slice(0, 1) }}</span>
                </span>
                <span class="resource-info">
                  <strong :title="item.title">{{ item.title }}</strong>
                  <p>{{ item.summary || '暂无资源介绍' }}</p>
                  <small>{{ resourceMeta(item) }}</small>
                </span>
                <span class="resource-actions">
                  <el-button type="primary" plain @click.stop="confirmDownload(item)"><el-icon><Download /></el-icon>下载</el-button>
                </span>
              </li>
            </ul>
          </section>
        </template>
        <div v-else-if="!loading" class="empty-state">
          <strong>{{ keyword ? '没有找到匹配资源' : '暂无下载资源' }}</strong>
          <span>{{ keyword ? '请尝试其他关键词' : '资源发布后将在这里展示' }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowDown, Download, Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { CmsDownload } from '../api/cms';
import { downloadApi, downloadsApi } from '../api/cms';

const router = useRouter();

interface DownloadGroup {
  name: string;
  items: CmsDownload[];
  page: number;
  total: number;
  loading: boolean;
  hasMore: boolean;
}
const pageSize = 8;
const loading = ref(false);
const keyword = ref('');
const failedCovers = ref(new Set<string>());
const groupState = reactive(new Map<string, DownloadGroup>());
const { data, runAsync } = downloadsApi();
const { runAsync: download } = downloadApi();
const groupedDownloads = computed(() => [...groupState.values()]);
const hasItems = computed(() => groupedDownloads.value.some((g) => g.items.length));

const hasCover = (item: CmsDownload) => Boolean(item.coverUrl && !failedCovers.value.has(item.id));
const markCoverFailed = (id: string) => {
  failedCovers.value = new Set([...failedCovers.value, id]);
};
const resourceMeta = (item: CmsDownload) => `${item.version ? `v${item.version.replace(/^v/i, '')} · ` : ''}${item.downloads ?? 0} 次下载`;
const rebuildGroups = (items: CmsDownload[], total: number) => {
  const grouped = new Map<string, CmsDownload[]>();
  items.forEach((item) => {
    const name = item.category?.trim() || '其他资源';
    grouped.set(name, [...(grouped.get(name) ?? []), item]);
  });
  groupState.clear();
  grouped.forEach((items, name) => groupState.set(name, { name, items, page: 1, total: items.length, loading: false, hasMore: items.length < total }));
};
const load = async () => {
  loading.value = true;
  try {
    await runAsync({ page: 1, pageSize, keyword: keyword.value.trim() || undefined });
    rebuildGroups(data.value?.list ?? [], data.value?.total ?? (data.value?.list ?? []).length);
  } finally {
    loading.value = false;
  }
};
const search = () => void load();
const openDetail = (item: CmsDownload) => router.push(`/aon/cms/download/${encodeURIComponent(item.slug)}`);
const loadMore = async (group: DownloadGroup) => {
  group.loading = true;
  try {
    const result = await runAsync({ page: group.page + 1, pageSize, keyword: keyword.value.trim() || undefined, category: group.name === '其他资源' ? undefined : group.name });
    const nextItems = result.list.filter((item) => item.category?.trim() === group.name || (!item.category?.trim() && group.name === '其他资源'));
    group.items.push(...nextItems.filter((item) => !group.items.some((old) => old.id === item.id)));
    group.page += 1;
    group.total = result.total;
    group.hasMore = group.items.length < result.total;
  } finally {
    group.loading = false;
  }
};
const confirmDownload = async (item: CmsDownload) => {
  try {
    await ElMessageBox.confirm(`确认下载“${item.title}”吗？`, '确认下载', { confirmButtonText: '确认下载', cancelButtonText: '取消', type: 'info' });
    const result = await download(item.slug);
    if (!result.url) return ElMessage.warning('资源暂未配置下载地址');
    window.open(result.url, '_blank', 'noopener,noreferrer');
    item.downloads = result.downloads ?? item.downloads + 1;
    ElMessage.success('已开始下载');
  } catch {
    // 用户取消下载时不提示错误。
  }
};

await load();
</script>

<style scoped>
.download-page {
  min-height: 100%;
  padding: 22px 20px 64px;
  color: #344054;
  background: #f8f9fb;
  box-sizing: border-box;
}
.download-shell {
  width: min(100%, 1080px);
  margin: 0 auto;
}
.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 38px;
  margin-bottom: 14px;
}
.page-heading h1 {
  margin: 0;
  color: #303846;
  font-size: 21px;
  font-weight: 500;
  line-height: 1.4;
}
.page-heading nav {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a3a9b3;
  font-size: 12px;
}
.page-heading a {
  color: #8b93a0;
  text-decoration: none;
}
.page-heading a:hover {
  color: #181c28;
}
.download-content {
  min-height: 280px;
}
.download-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin: 8px 0 18px;
  padding: 22px 24px;
  background: #fff;
  border: 1px solid #edf0f4;
}
.toolbar-kicker {
  color: #202b3d;
  font-size: 10px;
  letter-spacing: 1.2px;
}
.download-toolbar h2 {
  margin: 5px 0 4px;
  color: #303846;
  font-size: 20px;
  font-weight: 600;
}
.download-toolbar p {
  margin: 0;
  color: #929aa7;
  font-size: 12px;
}
.download-search {
  width: min(100%, 340px);
}
.category-section {
  margin-top: 14px;
  padding: 0 18px 8px;
  background: #fff;
  border: 1px solid #edf0f4;
}
.section-heading {
  display: flex;
  height: 52px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eceff3;
}
.section-heading h2 {
  position: relative;
  margin: 0;
  padding-left: 11px;
  color: #3b4555;
  font-size: 15px;
  font-weight: 500;
}
.section-heading h2::before {
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 0;
  width: 3px;
  content: '';
  background: #202b3d;
}
.section-heading > div {
  min-width: 0;
}
.section-heading span {
  display: block;
  margin-top: 3px;
  color: #a4aab3;
  font-size: 11px;
}
.resource-list {
  list-style: none;
  margin: 0;
  padding: 6px 0 12px;
}
.resource-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 6px;
  border-bottom: 1px solid #f1f3f6;
  cursor: pointer;
  transition: background 0.2s ease;
}
.resource-row:last-child {
  border-bottom: 0;
}
.resource-row:hover {
  background: #f7fafd;
}
.resource-thumb {
  flex: 0 0 auto;
  width: 72px;
  height: 72px;
  overflow: hidden;
  border-radius: 6px;
  background: #eef1f5;
}
.resource-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-fallback {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  background: #71829b;
}
.resource-info {
  flex: 1;
  min-width: 0;
}
.resource-info strong {
  display: block;
  overflow: hidden;
  color: #4a5361;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.resource-row:hover .resource-info strong {
  color: #181c28;
}
.resource-info p {
  display: -webkit-box;
  height: 34px;
  margin: 5px 0;
  overflow: hidden;
  color: #8b93a0;
  font-size: 12px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.resource-info small {
  color: #a1a8b2;
  font-size: 11px;
}
.resource-actions {
  flex: 0 0 auto;
}
.resource-actions .el-icon {
  margin-right: 4px;
}
.empty-state {
  display: flex;
  min-height: 280px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #a0a7b2;
  background: #fff;
}
.empty-state strong {
  color: #697386;
  font-size: 15px;
  font-weight: 500;
}
@media (max-width: 720px) {
  .download-page {
    padding: 18px 14px 48px;
  }
  .download-toolbar {
    display: block;
    padding: 18px;
  }
  .download-search {
    width: 100%;
    margin-top: 14px;
  }
  .category-section {
    padding: 0 12px 8px;
  }
  .resource-row {
    gap: 10px;
    padding: 10px 4px;
  }
  .resource-thumb {
    width: 56px;
    height: 56px;
  }
  .resource-info p {
    height: 31px;
  }
  .resource-actions .el-button {
    padding: 7px 10px;
  }
}
</style>
