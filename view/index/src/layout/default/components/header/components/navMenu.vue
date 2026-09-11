<template>
  <div class="nv-list" :class="{ mobile: mode === 'mobile' }">
    <template v-for="item in visibleItems" :key="item.path">
      <!-- 有可见子菜单：递归渲染 -->
      <div v-if="kids(item).length" class="nv-item" :class="{ top: depth === 0 && mode === 'desktop' }">
        <a class="nv-link" :class="{ 'is-active': isActive(item) }" @click="onGroupClick(item)">
          <span class="nv-text">{{ item.meta?.title }}</span>
          <svg v-if="mode === 'desktop' || kids(item).length" class="nv-caret" :class="{ side: mode === 'desktop' && depth > 0, open: mode === 'mobile' && expanded.has(item.path) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path v-if="mode === 'desktop' && depth > 0" d="m9 6 6 6-6 6" />
            <path v-else d="m6 9 6 6 6-6" />
          </svg>
        </a>
        <!-- 桌面端：悬停下拉（任意层级向右展开） -->
        <div v-if="mode === 'desktop'" class="nv-drop" :class="{ side: depth > 0 }">
          <nav-menu :items="kids(item)" :depth="depth + 1" mode="desktop" @navigate="emit('navigate')" />
        </div>
        <!-- 移动端：手风琴展开 -->
        <div v-else-if="expanded.has(item.path)" class="nv-sub">
          <nav-menu :items="kids(item)" :depth="depth + 1" mode="mobile" @navigate="emit('navigate')" />
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

const props = withDefaults(defineProps<{ items: RouteRecordRaw[]; mode?: 'desktop' | 'mobile'; depth?: number }>(), {
  mode: 'desktop',
  depth: 0,
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
const visibleItems = props.items.filter(canMenu).map(normalize);
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

const isActive = (item: RouteRecordRaw): boolean => {
  if (route.path === item.path) return true;
  //父级菜单：当前路由位于其子树内时高亮
  return route.path.startsWith(item.path.endsWith('/') ? item.path : item.path + '/');
};

const go = (item: RouteRecordRaw) => {
  if (item.meta?.isLink) {
    window.open(item.path, '_blank');
  } else {
    router.push(item.path);
  }
  emit('navigate');
};
const onGroupClick = (item: RouteRecordRaw) => {
  if (props.mode === 'mobile') {
    //移动端：展开/收起
    if (expanded.has(item.path)) {
      expanded.delete(item.path);
    } else {
      expanded.add(item.path);
    }
  }
};
</script>

<style lang="scss" scoped>
.nv-list {
  display: flex;
  align-items: center;
  gap: 2px;
}
.nv-item {
  position: relative;
}
.nv-link {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 9px 14px;
  font-size: 15px;
  font-weight: 500;
  color: #454b5c;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.2s;
  user-select: none;
}
.nv-caret {
  width: 14px;
  height: 14px;
  opacity: 0.55;
  transition: transform 0.2s;
  &.side {
    width: 13px;
    height: 13px;
  }
  &.open {
    transform: rotate(180deg);
  }
}

/* ---- 顶部一级：胶囊样式 ---- */
.nv-item.top > .nv-link:hover,
.nv-link:hover {
  color: #181c28;
  background: #f6f8fc;
}
.nv-link.is-active {
  color: #2b5cff;
  font-weight: 600;
}
/* 顶部一级菜单：当前页面位于其子树内时，显示明显选中态 */
.nv-item.top > .nv-link.is-active {
  color: #2b5cff;
  background: #eef2ff;
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
.nv-item:hover > .nv-drop {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  &.side {
    transform: translateX(0);
  }
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

/* ---- 移动端手风琴 ---- */
.nv-list.mobile {
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
  width: 100%;
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
.nv-list.mobile .nv-sub {
  padding-left: 14px;
}
</style>
