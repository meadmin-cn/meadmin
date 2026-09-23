<template>
  <section class="download-page">
    <div class="download-shell">
      <header class="page-heading">
        <h1>下载中心</h1>
        <nav aria-label="面包屑"><RouterLink to="/aon/cms">首页</RouterLink><span>/</span><span>下载中心</span></nav>
      </header>

      <div v-loading="loading" class="download-content">
        <template v-if="downloads.length">
          <section class="featured-grid" aria-label="推荐下载">
            <button v-if="featured[0]" class="featured-card featured-main" type="button" @click="handleDownload(featured[0].slug)">
              <span class="featured-media">
                <img v-if="hasCover(featured[0])" :src="featured[0].coverUrl" :alt="featured[0].title" @error="markCoverFailed(featured[0].id)" />
                <span v-else class="cover-fallback">{{ featured[0].title.slice(0, 1) }}</span>
              </span>
              <span class="featured-caption"
                ><strong>{{ featured[0].title }}</strong
                ><small>{{ resourceMeta(featured[0]) }}</small></span
              >
            </button>
            <div class="featured-side" :class="`featured-side-${Math.max(featured.length - 1, 0)}`">
              <button v-for="item in featured.slice(1, 5)" :key="item.id" class="featured-card featured-small" type="button" @click="handleDownload(item.slug)">
                <span class="featured-media">
                  <img v-if="hasCover(item)" :src="item.coverUrl" :alt="item.title" @error="markCoverFailed(item.id)" />
                  <span v-else class="cover-fallback">{{ item.title.slice(0, 1) }}</span>
                </span>
                <span class="featured-caption"
                  ><strong>{{ item.title }}</strong
                  ><small>{{ resourceMeta(item) }}</small></span
                >
              </button>
            </div>
          </section>

          <section v-for="group in groupedDownloads" :key="group.name" class="category-section">
            <header class="section-heading">
              <h2>{{ group.name }}</h2>
              <span>共 {{ group.items.length }} 项</span>
            </header>
            <div class="resource-grid">
              <button v-for="item in group.items" :key="item.id" class="resource-item" type="button" @click="handleDownload(item.slug)">
                <span class="resource-cover">
                  <img v-if="hasCover(item)" :src="item.coverUrl" :alt="item.title" loading="lazy" @error="markCoverFailed(item.id)" />
                  <span v-else class="cover-fallback">{{ item.title.slice(0, 1) }}</span>
                  <span class="download-mask">立即下载</span>
                </span>
                <strong :title="item.title">{{ item.title }}</strong>
                <small>{{ resourceMeta(item) }}</small>
              </button>
            </div>
          </section>
        </template>

        <div v-else-if="!loading" class="empty-state"><strong>暂无下载资源</strong><span>资源发布后将在这里展示</span></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';
import type { CmsDownload } from '../api/cms';
import { downloadApi, downloadsApi } from '../api/cms';

const loading = ref(false);
const failedCovers = ref(new Set<string>());
const { data, runAsync } = downloadsApi();
const { runAsync: download } = downloadApi();
const downloads = computed(() => data.value?.list ?? []);
const featured = computed(() => downloads.value.slice(0, 5));
const groupedDownloads = computed(() => {
  const groups = new Map<string, CmsDownload[]>();
  downloads.value.forEach((item) => {
    const name = item.category?.trim() || '其他资源';
    groups.set(name, [...(groups.get(name) ?? []), item]);
  });
  return [...groups.entries()].map(([name, items]) => ({ name, items }));
});

const hasCover = (item: CmsDownload) => Boolean(item.coverUrl && !failedCovers.value.has(item.id));
const markCoverFailed = (id: string) => {
  failedCovers.value = new Set([...failedCovers.value, id]);
};
const resourceMeta = (item: CmsDownload) => {
  const version = item.version?.trim();
  if (version) return /^v/i.test(version) ? version : `v${version}`;
  return `${item.downloads ?? 0} 次下载`;
};
const load = async () => {
  loading.value = true;
  try {
    await runAsync({ page: 1, pageSize: 50 });
  } finally {
    loading.value = false;
  }
};
const handleDownload = async (slug: string) => {
  const result = await download(slug);
  if (!result.url) {
    ElMessage.warning('资源暂未配置下载地址');
    return;
  }
  window.open(result.url, '_blank', 'noopener,noreferrer');
  ElMessage.success('已开始下载');
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
  color: #2789e8;
}
.download-content {
  min-height: 280px;
}
.featured-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.34fr) minmax(0, 1fr);
  height: 260px;
  gap: 8px;
  margin-bottom: 18px;
}
.featured-side {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 8px;
  min-width: 0;
}
.featured-side-1 {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}
.featured-side-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: 1fr;
}
.featured-side-3 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.featured-side-3 .featured-card:first-child {
  grid-row: 1 / 3;
}
.featured-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  padding: 0;
  color: #fff;
  text-align: left;
  border: 0;
  background: #778399;
  cursor: pointer;
}
.featured-media,
.featured-media img {
  display: block;
  width: 100%;
  height: 100%;
}
.featured-media img {
  object-fit: cover;
  transition: transform 0.3s ease;
}
.featured-card:hover .featured-media img {
  transform: scale(1.035);
}
.cover-fallback {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: rgba(255, 255, 255, 0.92);
  font-size: 36px;
  font-weight: 600;
  background: #71829b;
}
.featured-caption {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  min-width: 0;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 26px 14px 10px;
  background: linear-gradient(transparent, rgba(17, 24, 39, 0.78));
}
.featured-caption strong {
  min-width: 0;
  overflow: hidden;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.featured-main .featured-caption strong {
  font-size: 16px;
}
.featured-caption small {
  flex: 0 0 auto;
  color: rgba(255, 255, 255, 0.75);
  font-size: 11px;
}
.category-section {
  margin-top: 14px;
  padding: 0 18px 20px;
  background: #fff;
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
  background: #2789e8;
}
.section-heading span {
  color: #a4aab3;
  font-size: 11px;
}
.resource-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 18px 16px;
  padding-top: 18px;
}
.resource-item {
  min-width: 0;
  padding: 0;
  text-align: center;
  border: 0;
  background: transparent;
  cursor: pointer;
}
.resource-cover {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1.12 / 1;
  overflow: hidden;
  background: #eef1f5;
}
.resource-cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
}
.resource-cover .cover-fallback {
  font-size: 24px;
}
.download-mask {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 7px 4px;
  color: #fff;
  font-size: 11px;
  background: rgba(39, 137, 232, 0.9);
  opacity: 0;
  transform: translateY(100%);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.resource-item:hover .resource-cover img {
  transform: scale(1.04);
}
.resource-item:hover .download-mask,
.resource-item:focus-visible .download-mask {
  opacity: 1;
  transform: translateY(0);
}
.resource-item > strong {
  display: block;
  margin-top: 8px;
  overflow: hidden;
  color: #4a5361;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.resource-item:hover > strong {
  color: #2789e8;
}
.resource-item > small {
  display: block;
  margin-top: 2px;
  overflow: hidden;
  color: #a1a8b2;
  font-size: 10px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
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
@media (max-width: 960px) {
  .featured-grid {
    height: 230px;
  }
  .resource-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}
@media (max-width: 720px) {
  .download-page {
    padding: 18px 14px 48px;
  }
  .featured-grid {
    grid-template-columns: 1fr;
    height: auto;
  }
  .featured-main {
    aspect-ratio: 16 / 8.5;
  }
  .featured-side {
    height: auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: auto;
  }
  .featured-side-1 {
    grid-template-columns: 1fr;
  }
  .featured-side-3 .featured-card:first-child {
    grid-row: auto;
  }
  .featured-small {
    aspect-ratio: 1.55 / 1;
  }
  .resource-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px 12px;
  }
}
@media (max-width: 480px) {
  .download-page {
    padding: 15px 10px 40px;
  }
  .page-heading {
    margin-bottom: 10px;
  }
  .page-heading h1 {
    font-size: 19px;
  }
  .featured-side {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .featured-caption {
    display: block;
    padding: 24px 9px 7px;
  }
  .featured-caption strong {
    display: block;
    font-size: 12px;
  }
  .featured-caption small {
    display: none;
  }
  .featured-main .featured-caption strong {
    font-size: 14px;
  }
  .category-section {
    padding: 0 12px 16px;
  }
  .section-heading {
    height: 46px;
  }
  .resource-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 15px 10px;
    padding-top: 14px;
  }
  .resource-item > strong {
    font-size: 11px;
  }
}
</style>
