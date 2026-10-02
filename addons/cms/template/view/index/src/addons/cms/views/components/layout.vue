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
import { CMS_CATEGORY_TYPE, navigationApi } from '../../api/cms';

const router = useRouter();
const route = useRoute();

const searchKeyword = ref('');
const showMobileSearch = ref(false);
const navigation = ref<CmsNavigation>({ categories: [], tags: [], topics: [], pages: [] });

// 头部菜单完全由栏目驱动：栏目自身的 type 决定这一项怎么跳转，
// 1 文章列表 → 栏目文章列表页；2 目录 → 仅作分组，点击进入该目录的聚合页；3 跳转链接 → 新窗口打开目标地址。
const categoryMenus = (items: CmsNavigation['categories']): RouteRecordRaw[] => {
  const list: RouteRecordRaw[] = [];
  for (const cat of items) {
    // 关闭「导航显示」的栏目连同其子栏目一起从头部隐藏
    if (cat.isNav === false) continue;
    const children = cat.children?.length ? categoryMenus(cat.children) : [];
    if (cat.type === CMS_CATEGORY_TYPE.link) {
      const url = (cat.linkUrl ?? '').trim();
      if (!url) continue;
      list.push({ path: url, meta: { title: cat.title, isLink: true, target: '_blank' } } as unknown as RouteRecordRaw);
      continue;
    }
    const path = `/aon/cms/category/${cat.slug}`;
    list.push({
      path,
      // groupPath：分组项自身可访问的地址，桌面端点击父级时进入栏目聚合页而不是第一个子栏目
      meta: {
        title: cat.title,
        alwaysShow: children.length > 0,
        groupPath: children.length ? path : undefined,
        // 目录类型仅作分组，供样式与后续扩展区分
        isChannel: cat.type === CMS_CATEGORY_TYPE.channel,
      },
      children: children.length ? children : undefined,
    } as RouteRecordRaw);
  }
  return list;
};

// 动态生成头部菜单
const headerMenus = computed<RouteRecordRaw[]>(() => {
  const menus: RouteRecordRaw[] = [{ path: '/aon/cms', meta: { title: '首页' } } as RouteRecordRaw];
  menus.push(...categoryMenus(navigation.value.categories));
  navigation.value.pages.forEach((page) => {
    if (page.kind === 2 && page.link) menus.push({ path: page.link, meta: { title: page.title, isLink: true, target: page.target === 1 ? '_blank' : '_self' } } as unknown as RouteRecordRaw);
    else menus.push({ path: `/aon/cms/page/${page.slug}`, meta: { title: page.title } } as RouteRecordRaw);
  });
  if (navigation.value.topics?.length) {
    menus.push({
      path: '/aon/cms/topic',
      meta: { title: '专题' },
      children: navigation.value.topics.map((topic) => ({ path: `/aon/cms/topic/${topic.slug}`, meta: { title: topic.title } })),
    } as unknown as RouteRecordRaw);
  }
  // 下载中心与留言板是站点功能入口，不属于内容栏目，固定放在菜单末尾
  menus.push({ path: '/aon/cms/download', meta: { title: '下载中心' } } as RouteRecordRaw);
  menus.push({ path: '/aon/cms/message', meta: { title: '留言板' } } as RouteRecordRaw);
  return menus;
});

// 计算当前激活的菜单路径：栏目页按实际栏目路由激活，详情页回到首页。
const activeMenu = computed(() => {
  if (route.path.startsWith('/aon/cms/category/') || route.path === '/aon/cms/download' || route.path === '/aon/cms/message' || route.path.startsWith('/aon/cms/page/')) return route.path;
  if (route.path.startsWith('/aon/cms/topic')) return '/aon/cms/topic';
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
