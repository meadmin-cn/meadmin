<template>
  <Layout :menus="headerMenus" :active="activeMenu">
    <template #header-right>
      <div class="cms-header-actions">
        <el-input v-model="searchKeyword" placeholder="搜索内容" class="cms-search-input" clearable @keyup.enter="handleSearch">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </template>
    <template #header-mobile-right>
      <div class="cms-header-actions mobile">
        <el-button text @click="showMobileSearch = true">
          <el-icon><Search /></el-icon>
        </el-button>
      </div>
      <el-dialog v-model="showMobileSearch" title="搜索内容" width="90%">
        <el-input v-model="searchKeyword" placeholder="搜索内容" clearable @keyup.enter="handleSearchMobile">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </el-dialog>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import Layout from '@/layout/default/index.vue';
import { Search } from '@element-plus/icons-vue';
import type { RouteRecordRaw } from 'vue-router';
import type { CmsNavigation } from '../../api/cms';
import { CMS_CATEGORY_TYPE, detailApi, navigationApi } from '../../api/cms';

const router = useRouter();
const route = useRoute();

const searchKeyword = ref('');
const showMobileSearch = ref(false);
const navigation = ref<CmsNavigation>({ categories: [], tags: [], topics: [], pages: [] });
const detailCategoryId = ref<string>();
const { runAsync: getDetail } = detailApi();

// 头部菜单完全由栏目驱动：首页固定在最前，其余菜单项全部来自后台「CMS - 栏目」，
// 栏目类型决定落地地址：1/2 文章列表/目录 → 栏目聚合页；3 外链 → 新窗口打开 linkUrl；
// 4 自定义表单 → 表单页（如留言板）；5 单页 → 单页（如关于我们）；6 下载列表 → 下载中心。
// 因此不再需要在前台硬编码「下载中心 / 留言板」等站点入口，它们本身就是可配置的栏目。
const categoryMenus = (items: CmsNavigation['categories']): RouteRecordRaw[] => {
  const list: RouteRecordRaw[] = [];
  for (const cat of items) {
    // 关闭「导航显示」的栏目连同其子栏目一起从头部隐藏
    if (cat.isNav === false) continue;
    const children = cat.children?.length ? categoryMenus(cat.children) : [];
    const link = (cat.link ?? '').trim();
    // 未解析出落地地址（如类型 4/5 但未配置目标）的栏目不进入菜单，避免点击后无处可去
    if (!link) continue;
    const isExternal = cat.type === CMS_CATEGORY_TYPE.link;
    list.push({
      path: link,
      meta: {
        title: cat.title,
        isLink: isExternal,
        target: isExternal ? '_blank' : undefined,
        alwaysShow: children.length > 0,
        groupPath: children.length ? link : undefined,
        // 目录类型仅作分组，供样式与后续扩展区分
        isChannel: cat.type === CMS_CATEGORY_TYPE.channel,
      },
      children: children.length ? children : undefined,
    } as RouteRecordRaw);
  }
  return list;
};

// 动态生成头部菜单：首页 + 全部栏目，不掺入任何硬编码入口
const headerMenus = computed<RouteRecordRaw[]>(() => [{ path: '/aon/cms', meta: { title: '首页' } } as RouteRecordRaw, ...categoryMenus(navigation.value.categories)]);

const findCategoryPath = (items: CmsNavigation['categories'], categoryId: string, parents: CmsNavigation['categories'] = []): CmsNavigation['categories'] => {
  for (const category of items) {
    const path = [...parents, category];
    if (category.id === categoryId) return path;
    if (category.children?.length) {
      const hit = findCategoryPath(category.children, categoryId, path);
      if (hit.length) return hit;
    }
  }
  return [];
};

const categoryMenuLink = (categoryId?: string) => {
  if (!categoryId) return '';
  const path = findCategoryPath(navigation.value.categories, categoryId);
  return [...path].reverse().find((category) => category.link)?.link || '';
};

// 当前激活的菜单路径：栏目页（含下载列表型栏目）/自定义表单页/单页各自对齐自己的菜单项；
// 文章详情按返回的 categoryId 递归定位栏目，避免详情页错误高亮首页。
const activeMenu = computed(() => {
  if (['cms-category', 'cms-diyform'].includes(String(route.name))) return route.path;
  if (route.path.startsWith('/aon/cms/page/')) return route.path;
  if (route.params.kind === 'article' || route.path.startsWith('/aon/cms/article/')) return categoryMenuLink(detailCategoryId.value) || '/aon/cms';
  return '/aon/cms';
});

const loadDetailCategory = async () => {
  detailCategoryId.value = undefined;
  if (route.path.startsWith('/aon/cms/article/') && route.params.slug) {
    try {
      detailCategoryId.value = (await getDetail('article', String(route.params.slug))).categoryId;
    } catch {
      detailCategoryId.value = undefined;
    }
  }
};

// SSR 与客户端首帧都使用同一份栏目导航，避免头部先渲染旧路由菜单、再异步替换造成布局水合错位。
try {
  navigation.value = await navigationApi().runAsync();
  await loadDetailCategory();
} catch (error) {
  console.error('Failed to load navigation:', error);
}

watch(
  () => route.fullPath,
  () => {
    void loadDetailCategory();
  },
);

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/aon/cms', query: { keyword: searchKeyword.value } });
  }
};

const handleSearchMobile = () => {
  handleSearch();
  showMobileSearch.value = false;
};
</script>

<style lang="scss" scoped>
.cms-header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;

  &.mobile {
    gap: 0.5rem;
  }

  .cms-search-input {
    /* 头部菜单已完全由栏目驱动，栏目较多时需要给导航让出空间，这里收窄搜索框 */
    width: 148px;
  }
}

@media (max-width: 980px) {
  .cms-header-actions:not(.mobile) {
    display: none;
  }
}
</style>
