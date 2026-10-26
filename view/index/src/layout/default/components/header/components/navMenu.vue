<template>
  <div class="nv-list" :class="{ mobile: mode === 'mobile' }">
    <template v-for="item in visibleItems" :key="item.path">
      <!-- 有可见子菜单：递归渲染 -->
      <div v-if="kids(item).length" class="nv-item" :class="{ top: depth === 0 && mode === 'desktop', overflow: mode === 'desktop' && depth === 0 && item.meta?.overflowMenu }">
        <div class="nv-group-control" :class="{ 'is-active': isActive(item) }">
          <a class="nv-link" :class="{ 'is-active': isActive(item), 'is-overflow': item.meta?.overflowMenu }" @click="onGroupClick(item)">
            <span class="nv-text">{{ item.meta?.title }}</span>
          </a>
          <button v-if="mode === 'mobile'" class="nv-caret-toggle" :aria-label="`${item.meta?.title ?? '栏目'}子菜单`" :aria-expanded="expanded.has(item.path)" @click="toggleGroup(item)">
            <svg class="nv-caret" :class="{ open: expanded.has(item.path) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          </button>
          <svg v-else class="nv-caret" :class="{ side: depth > 0 }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path v-if="depth > 0" d="m9 6 6 6-6 6" />
            <path v-else d="m6 9 6 6 6-6" />
          </svg>
        </div>
        <!-- 桌面端：悬停下拉（任意层级向右展开） -->
        <div v-if="mode === 'desktop'" class="nv-drop" :class="{ side: depth > 0 }">
          <nav-menu :items="kids(item)" :depth="depth + 1" mode="desktop" :active="active" @navigate="emit('navigate')" />
        </div>
        <!-- 移动端：手风琴展开 -->
        <div v-else-if="expanded.has(item.path)" class="nv-sub">
          <nav-menu :items="kids(item)" :depth="depth + 1" mode="mobile" :active="active" @navigate="emit('navigate')" />
        </div>
      </div>
      <!-- 叶子菜单 -->
      <a v-else class="nv-link" :class="{ 'is-active': isActive(item) }" @click="go(item)">
        <span class="nv-text">{{ item.meta?.title }}</span>
      </a>
    </template>
  </div>
</template>

<script setup lang="ts" name="LayoutNavMenu">
import { reactive } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

const props = withDefaults(defineProps<{ items: RouteRecordRaw[]; mode?: 'desktop' | 'mobile'; depth?: number; active?: string }>(), {
  mode: 'desktop',
  depth: 0,
  active: '',
});
const emit = defineEmits<{ navigate: [] }>();

const route = useRoute();
const router = useRouter();
//移动端各层级的展开状态（每个递归实例独立管理自己层级）
const expanded = reactive(new Set<string>());

//是否作为菜单
const canMenu = (menu: RouteRecordRaw): boolean => {
  if (!menu.meta?.hideMenu) {
    return true;
  }
  if (menu.children?.length) {
    return menu.children.some((v) => canMenu(v));
  }
  return false;
};
//保持响应式：items 可能由外部接口数据驱动（如 doc 插件切换版本后菜单整体替换）
const visibleItems = computed(() => props.items.filter(canMenu).map(normalize));
const kids = (item: RouteRecordRaw): RouteRecordRaw[] => (item.children ?? []).filter(canMenu).map(normalize);

//仅有一个可见子菜单时，父级折叠为该子菜单（与框架原 menuItem 行为一致，meta.alwaysShow 可强制保留父级）
function normalize(item: RouteRecordRaw): RouteRecordRaw {
  if (!item.children?.length) {
    return item;
  }
  const children = item.children.filter(canMenu);
  if (!item.meta?.alwaysShow && children.length === 1) {
    return normalize(children[0]);
  }
  return { ...item, children };
}

//当前激活路径：优先使用外部传入的 active（如 doc 插件按路由参数计算），缺省取当前路由
const currentPath = computed(() => props.active || route.path);
const isActive = (item: RouteRecordRaw): boolean => {
  const path = currentPath.value;
  if (!path) return false;
  if (path === item.path) return true;
  // 传入 active 时按精确路径判断，避免首页路径因前缀匹配在栏目页继续高亮。
  if (props.active) return kids(item).some((child) => isActive(child));
  if (item.path !== '/' && !item.path.endsWith('/') && path.startsWith(item.path + '/')) return true;
  if (item.path.endsWith('/') && path.startsWith(item.path)) return true;
  return kids(item).some((child) => isActive(child));
};

const go = (item: RouteRecordRaw) => {
  if (item.meta?.isLink) {
    window.open(item.path, '_blank');
  } else {
    router.push(item.path);
  }
  emit('navigate');
};
const firstLeaf = (item: RouteRecordRaw): RouteRecordRaw => {
  const children = kids(item);
  return children.length ? firstLeaf(children[0]) : item;
};
const onGroupClick = (item: RouteRecordRaw) => {
  if (props.mode === 'desktop') {
    // 分组自身带可访问页面时优先进入该页面（如 CMS 栏目聚合页），否则进入第一个子项。
    if (item.meta?.overflowMenu) return;
    const groupPath = item.meta?.groupPath ? String(item.meta.groupPath) : '';
    go(groupPath ? ({ ...item, path: groupPath } as RouteRecordRaw) : firstLeaf(item));
    return;
  }
  // 移动端父项文字负责进入父栏目，箭头按钮独立控制子菜单展开。
  go(item);
};
const toggleGroup = (item: RouteRecordRaw) => {
  if (expanded.has(item.path)) expanded.delete(item.path);
  else expanded.add(item.path);
};
</script>

<style lang="scss" scoped>
.nv-list {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: max-content;
}
.nv-list > .nv-item,
.nv-list > .nv-link {
  flex: 0 0 auto;
}
.nv-list > .nv-item.overflow {
  display: flex;
  min-width: 58px;
  flex: 1 1 58px;
  justify-content: flex-start;
}
.nv-item {
  position: relative;
}
.nv-group-control {
  display: inline-flex;
  align-items: center;
  border-radius: 8px;
  transition: background 0.2s;
}
.nv-group-control > .nv-link {
  padding-right: 3px;
}
.nv-group-control > .nv-caret {
  margin-right: 10px;
}
.nv-link {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 9px 10px;
  font-size: 15px;
  font-weight: 500;
  color: #454b5c;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.2s;
  user-select: none;
}
.nv-text {
  display: inline-block;
  white-space: nowrap;
}
.nv-link.is-overflow {
  width: 46px;
  height: 42px;
  padding: 0;
  justify-content: center;
  font-size: 0;
  line-height: 1;
  box-sizing: border-box;
}
.nv-link.is-overflow .nv-text {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: inherit;
  font-size: 22px;
  line-height: 1;
  transform: translateY(-2px);
}
.nv-link.is-overflow .nv-caret {
  display: none;
}
.nv-caret {
  width: 12px;
  height: 12px;
  opacity: 0.55;
  transition: transform 0.2s;
  &.side {
    width: 12px;
    height: 12px;
  }
  &.open {
    transform: rotate(180deg);
  }
}

/* ---- 顶部一级：胶囊样式 ---- */
.nv-link:hover {
  color: #181c28;
  background: #f6f8fc;
}
.nv-link.is-active {
  color: #2b5cff;
  font-weight: 600;
}
/* 带箭头的父项：箭头是 .nv-link 的兄弟节点，背景必须画在 .nv-group-control 上才能盖住箭头，
   否则会出现「文字有底色、箭头裸在外面」的断层。此时 link 自身不再画背景。 */
.nv-group-control > .nv-link:hover,
.nv-group-control > .nv-link.is-active {
  background: transparent;
}
.nv-list:not(.mobile) > .nv-item > .nv-group-control:not(.is-active):hover,
.nv-drop .nv-item > .nv-group-control:not(.is-active):hover {
  color: #181c28;
  background: #f6f8fc;
}
/* 顶部一级菜单：当前页面位于其子树内时，显示明显选中态（整行含箭头） */
.nv-item.top > .nv-group-control.is-active {
  background: #eef2ff;
}
.nv-item.top > .nv-group-control.is-active > .nv-caret {
  color: #2b5cff;
}

/* ---- 桌面端下拉（支持任意层级） ---- */
.nv-drop {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 70;
  min-width: 200px;
  padding-top: 10px; /* 悬停桥，防止移动到下拉途中断开 */
  opacity: 0;
  visibility: hidden;
  transform: translateY(6px);
  transition:
    opacity 0.18s ease,
    transform 0.18s ease,
    visibility 0.18s;
  > .nv-list {
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
    padding: 8px;
    background: #fff;
    border: 1px solid #e8ebf2;
    border-radius: 12px;
    box-shadow: 0 12px 32px -10px rgba(24, 36, 88, 0.18);
  }
  &.side {
    top: -10px;
    left: 100%;
    padding-top: 0;
    padding-left: 10px;
    transform: translateX(6px);
  }
}
.nv-item.overflow > .nv-drop {
  left: 50%;
  transform: translate(-50%, 6px);
}
.nv-item:hover > .nv-drop {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  &.side {
    transform: translateX(0);
  }
}
.nv-item.overflow:hover > .nv-drop {
  transform: translate(-50%, 0);
}
/* 下拉内的行样式 */
.nv-drop .nv-link {
  justify-content: space-between;
  padding: 10px 12px;
  font-size: 14.5px;
  border-radius: 8px;
}
/* 下拉行选中态：父级与当前页都高亮 */
.nv-drop .nv-link.is-active {
  color: #2b5cff;
  background: #f0f4ff;
}
/* 下拉内的父项（带箭头）：底色同样画在整行上，link 自身不着色 */
.nv-drop .nv-group-control > .nv-link.is-active {
  background: transparent;
}
.nv-drop .nv-item > .nv-group-control.is-active {
  background: #f0f4ff;
}
.nv-drop .nv-item > .nv-group-control.is-active > .nv-caret {
  color: #2b5cff;
}

/* ---- 移动端手风琴 ---- */
.nv-list.mobile {
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
  width: 100%;
}
.nv-list.mobile .nv-group-control {
  display: flex;
  width: 100%;
}
.nv-list.mobile .nv-group-control > .nv-link {
  flex: 1;
  padding-right: 12px;
}
.nv-caret-toggle {
  display: inline-flex;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  color: #454b5c;
  background: transparent;
  cursor: pointer;
}
.nv-caret-toggle:hover {
  background: #f6f8fc;
}
.nv-list.mobile .nv-link {
  justify-content: space-between;
  padding: 12px;
  font-size: 16px;
  color: #181c28;
}
.nv-list.mobile .nv-link.is-active {
  color: #2b5cff;
  background: #f0f4ff;
}
/* 父级组选中：仅文字高亮不加背景，与子项的背景选中态区分开，避免两块背景粘连 */
.nv-list.mobile .nv-item > .nv-group-control > .nv-link.is-active {
  background: none;
}
.nv-list.mobile .nv-sub {
  margin-top: 4px;
  padding-left: 14px;
}
</style>
