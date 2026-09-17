import { jump, resolvePath } from '@/router';
import { useGlobalStore, useRouteStore } from '@/store';
import type { RouteRecordRaw } from 'vue-router';

import { debounce } from 'lodash-es';
type SearchMenuItem = { path: string; isLink?: boolean; title: string[] };

const createMenuList = (routes: RouteRecordRaw[], baseTitle: string[] = [], basePath = ''): SearchMenuItem[] => {
  const menuList: SearchMenuItem[] = [];
  routes.forEach((item) => {
    if (item.meta?.title) {
      const path = resolvePath(item.path, basePath);
      const title = [...baseTitle, item.meta.title];
      // 隐藏的权限分组不算可见子菜单，与侧栏的叶子判断保持一致。
      const hasVisibleChildren = item.children?.some((child) => child.meta && !child.meta.hideMenu);
      if (!item.meta.hideMenu && (item.redirect || !hasVisibleChildren)) {
        menuList.push({
          path,
          title,
          isLink: item.meta.isLink,
        });
      }
      if (item.children) {
        menuList.push(...createMenuList(item.children, title, path));
      }
    }
  });
  return menuList;
};

export const useSearchMenu = (debounceTime = 500) => {
  const { i18n } = useGlobalStore();
  const routeStore = useRouteStore();
  // 每次搜索读取当前授权路由，避免首次索引缓存导致新菜单缺失。
  const menuList = computed(() => createMenuList(routeStore.routes));
  const filteredMenu = ref<{ path: string; meta: { isLink?: boolean; title: string } }[]>([]);
  const activeIndex = ref(0);
  const search = debounce((searchText: string) => {
    filteredMenu.value = [];
    activeIndex.value = 0;
    searchText &&
      menuList.value.forEach((item) => {
        const title = item.title.map((v) => i18n.t(v)).join(' > ');
        if (title.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())) {
          filteredMenu.value.push({
            path: item.path,
            meta: {
              title,
              isLink: item.isLink,
            },
          });
        }
        return filteredMenu.value;
      });
  }, debounceTime);

  // Arrow key up
  function handleUp() {
    if (!filteredMenu.value.length) return false;
    activeIndex.value--;
    if (activeIndex.value < 0) {
      activeIndex.value = filteredMenu.value.length - 1;
    }
    return true;
  }

  // Arrow key down
  function handleDown() {
    if (!filteredMenu.value.length) return false;
    activeIndex.value++;
    if (activeIndex.value > filteredMenu.value.length - 1) {
      activeIndex.value = 0;
    }
    return true;
  }

  // enter keyboard event
  async function handleEnter() {
    if (!filteredMenu.value[activeIndex.value]) return false;
    jump(filteredMenu.value[activeIndex.value]);
    return true;
  }

  return {
    search,
    filteredMenu,
    activeIndex,
    handleUp,
    handleDown,
    handleEnter,
  };
};
