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
import { navigationApi } from '../../api/cms';

const router = useRouter();
const route = useRoute();

const searchKeyword = ref('');
const showMobileSearch = ref(false);
const navigation = ref<CmsNavigation>({ categories: [], tags: [], topics: [], pages: [] });

// 动态生成头部菜单
const headerMenus = computed<RouteRecordRaw[]>(() => {
  const menus: RouteRecordRaw[] = [{ path: '/aon/cms', meta: { title: '首页' } } as RouteRecordRaw];

  // 保留完整栏目树：父栏目用于分组，也可进入当前栏目并查看其下级内容。
  const mapCategories = (items: CmsNavigation['categories']): RouteRecordRaw[] =>
    items.map(
      (cat) =>
        ({
          path: `/aon/cms/category/${cat.slug}`,
          meta: { title: cat.title, alwaysShow: Boolean(cat.children?.length) },
          children: cat.children?.length ? mapCategories(cat.children) : undefined,
        }) as RouteRecordRaw,
    );
  menus.push(...mapCategories(navigation.value.categories));
  menus.push({ path: '/aon/cms/download', meta: { title: '下载中心' } } as RouteRecordRaw);
  menus.push({ path: '/aon/cms/message', meta: { title: '留言板' } } as RouteRecordRaw);
  navigation.value.pages.forEach((page) => {
    if (page.kind === 2 && page.link) menus.push({ path: page.link, meta: { title: page.title, isLink: true, target: page.target === 1 ? '_blank' : '_self' } } as unknown as RouteRecordRaw);
    else menus.push({ path: `/aon/cms/page/${page.slug}`, meta: { title: page.title } } as RouteRecordRaw);
  });
  return menus;
});

// 计算当前激活的菜单路径：栏目页按实际栏目路由激活，详情页回到首页。
const activeMenu = computed(() => {
  if (route.path.startsWith('/aon/cms/category/') || route.path === '/aon/cms/download' || route.path === '/aon/cms/message' || route.path.startsWith('/aon/cms/page/')) return route.path;
  return '/aon/cms';
});

// 加载导航数据
onMounted(async () => {
  try {
    navigation.value = await navigationApi().runAsync();
  } catch (error) {
    console.error('Failed to load navigation:', error);
  }
});

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
    width: 220px;
  }
}

@media (max-width: 980px) {
  .cms-header-actions:not(.mobile) {
    display: none;
  }
}
</style>
