<template>
  <div class="tag-bar">
    <a class="icon pointer" :class="{ 'is-disabled': scrollLeft <= 0 }" @click="back">
      <me-icon-arrow-double-left></me-icon-arrow-double-left>
    </a>
    <el-scrollbar ref="scrollbarRef" view-class="list-parent" style="flex-grow: 1" @scroll="({ scrollLeft: left }: any) => (scrollLeft = left)">
      <div ref="listRef" class="list">
        <div v-for="tag in tags" :key="tag.fullPath" ref="tagsRef" class="item pointer" :class="{ active: tag.fullPath === currentTag?.fullPath }" @click="push(tag)" @contextmenu.prevent="setContextmenu($event.currentTarget as any, tag)">
          <!-- 设计稿 .tag .dot：6px 灰色圆点（选中态变白） -->
          <i class="dot"></i>
          {{ $t(tag.meta.title!) }}
          <div v-if="!tag.meta.affix" class="del-icon" @click.stop="close($event.currentTarget as any, tag)">
            <mel-icon-close />
          </div>
        </div>
      </div>
    </el-scrollbar>
    <div class="right">
      <div class="icon pointer" :class="{ 'is-disabled': Math.ceil(scrollLeft) >= max }" @click="go">
        <me-icon-arrow-double-right></me-icon-arrow-double-right>
      </div>
      <div v-if="themeConfig.tagBarRefresh" class="icon pointer" @click="reload">
        <mel-icon-refresh :class="{ rotate: reoadUrl }"></mel-icon-refresh>
      </div>
      <div v-if="themeConfig.tagBarMenu" class="icon tag-menu-icon pointer" @click.stop="setContextmenu($event.currentTarget as any, currentTag)">
        <!-- 设计稿 v1.4 tag-tools：☰ 三线菜单图标 -->
        <me-icon-tag-menu></me-icon-tag-menu>
      </div>
    </div>
  </div>
  <contextmenu
    v-if="virtualRef"
    ref="contextmenuRef"
    v-model:visible="showContextmenu"
    :virtual-ref="virtualRef"
    :current="contextmenuCurrent"
    :model-value="tags"
    @update:model-value="
      ($event: any) => {
        tags.splice(0, tags.length, ...$event);
      }
    "
  >
  </contextmenu>
</template>
<script setup lang="ts" name="TagBar">
import { event, mitter } from '@/event';
import { useRouteStore, useSettingStore } from '@/store';
import { getColorLuma, mixColor } from '@/utils/helper';
import { isExternal } from '@/utils/validate';
import { ElScrollbar } from 'element-plus';
import $ from 'jquery';
import { resolve } from 'path-browserify';
import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import contextmenu from './components/contextmenu.vue';
const { themeConfig } = storeToRefs(useSettingStore());
// 初始化tags
const tags = reactive([] as RouteLocationNormalized[]);
const resolvePath = (routePath: string, basePath = '') => {
  if (isExternal(routePath) || isExternal(basePath)) {
    return routePath;
  }
  return resolve(basePath, routePath);
};
const addAffixTags = (routes: RouteRecordRaw[], basePath = '') => {
  routes.forEach((item) => {
    if (item.meta?.affix && item.meta.title) {
      tags.push({
        fullPath: resolvePath(item.path, basePath),
        hash: '',
        query: {},
        matched: [],
        redirectedFrom: undefined,
        meta: { ...item.meta },
      } as unknown as RouteLocationNormalized);
    }
    if (item.children) {
      addAffixTags(item.children, resolvePath(item.path, basePath));
    }
  });
};
addAffixTags(useRouteStore().routes);

// 滚动设置
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();
const listRef = ref<HTMLDivElement>();
let scrollLeft = ref(0);
const setScrollLeft = (left: number, isAdd = false) => {
  if (isAdd) {
    left = left + scrollLeft.value;
  }
  $(scrollbarRef.value!.$el).find('.el-scrollbar__wrap').animate({ scrollLeft: left }, 300);
};
const tagsRef = ref([] as HTMLElement[]);
const currentTag = ref<RouteLocationNormalized>({
  fullPath: '/',
  meta: { title: '' },
} as RouteLocationNormalized);
const route = useRoute();
const max = ref(0);
const setMax = () => {
  max.value = listRef.value!.offsetWidth - scrollbarRef.value?.$el.clientWidth;
};
onMounted(() => {
  mitter.on(event.RESIZE, setMax, true);
  watch(tags, setMax, {
    flush: 'post',
    immediate: true,
  });
});
const back = () => {
  setScrollLeft(0 - scrollbarRef.value!.$el.clientWidth / 2, true);
};
const go = () => {
  setScrollLeft(scrollbarRef.value!.$el.clientWidth / 2, true);
};
const jump = (index: number) => {
  nextTick(() => {
    if (tagsRef.value[index]) {
      currentTag.value = tags[index];
      if (index === 0) {
        setScrollLeft(0);
        return;
      }
      if (index === tagsRef.value.length - 1) {
        max.value > 0 && setScrollLeft(max.value);
        return;
      }
      const parentWidth = scrollbarRef.value!.$el.clientWidth;
      const parentLeft = scrollLeft.value;
      const parentRight = parentWidth + scrollLeft.value;
      const lastLeft = tagsRef.value[index - 1].offsetLeft;
      const offsetLeft = tagsRef.value[index].offsetLeft;
      const offsetRight = offsetLeft + tagsRef.value[index].offsetWidth;
      const nextLeft = tagsRef.value[index + 1].offsetLeft;
      const nextRight = nextLeft + tagsRef.value[index + 1].offsetWidth;
      if (parentWidth <= offsetRight - lastLeft || parentWidth <= nextRight - offsetLeft) {
        setScrollLeft(offsetLeft);
      } else if (lastLeft < parentLeft) {
        setScrollLeft(lastLeft);
      } else if (nextRight > parentRight) {
        setScrollLeft(nextRight - parentWidth);
      }
    }
  });
};
// 动态设置active
const setTag = (route: RouteLocationNormalized) => {
  if (route.meta.title && !route.meta.hideTag) {
    let index = tags.findIndex((item) => item.fullPath === route.fullPath);
    if (index > -1) {
      return jump(index);
    }
    tags.push({ ...route });
    return jump(tags.length - 1);
  }
};
setTag(route);
mitter.on(event.BEFORE_ROUTE_CHANGE, ({ to }) => setTag(to), true);
const router = useRouter();
const push = (route: RouteLocationNormalized) => {
  if (route.fullPath !== currentTag.value!.fullPath) {
    router.push(route.fullPath);
  }
};
const contextmenuCurrent = ref(currentTag.value);
const virtualRef = ref<HTMLElement>();
const showContextmenu = ref(false);
const contextmenuRef = ref<InstanceType<typeof contextmenu>>();
const setContextmenu = (event: HTMLElement, current: RouteLocationNormalized, show = true) => {
  virtualRef.value = event;
  contextmenuCurrent.value = current;
  showContextmenu.value = show;
};
const close = async (event: HTMLElement, current: RouteLocationNormalized) => {
  setContextmenu(event, current, false);
  await nextTick();
  contextmenuRef.value?.closeCurrent();
};
const closeContextMenu = () => {
  showContextmenu.value = false;
};
onMounted(() => {
  document.body.addEventListener('click', closeContextMenu);
});
onBeforeUnmount(() => {
  document.body.removeEventListener('click', closeContextMenu);
});
const reload = () => {
  // 刷新
  router.replace('/redirect/' + encodeURIComponent(route.fullPath));
};
const reoadUrl = ref('');
watch(route, () => {
  if (route.name == 'redirect') {
    reoadUrl.value = route.params.path as string;
  } else if (reoadUrl.value == route.fullPath) {
    setTimeout(() => {
      reoadUrl.value = '';
    }, 500);
  }
});
const menuBg1 = computed(() => mixColor(themeConfig.value.menuBg, getColorLuma(themeConfig.value.menuBg) < 100 ? '#ffffff' : '#303133', 0.1));
</script>
<style lang="scss" scoped>
.tag-bar {
  // border-bottom: 1px solid var(--el-border-color);
  box-shadow: 0 1px var(--el-border-color);

  height: $header-tag-height;
  display: flex;
  align-items: center;
  background-color: var(--el-bg-color);
  padding: 0 8px;
  @at-root .dark #{&} {
    box-shadow: 0 1px v-bind(menuBg1);
  }
  .is-disabled {
    color: var(--el-disabled-text-color) !important;
    cursor: not-allowed;
  }

  .icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    flex-shrink: 0;
    font-size: 15px;
    color: var(--el-text-color-regular);

    :deep(svg) {
      width: 16px;
      height: 16px;
    }

    .rotate {
      animation: loading-rotate 1s linear infinite;
    }
  }

  .icon:hover {
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-primary);
  }

  .tag-menu-icon {
    background-color: transparent;
    color: var(--el-text-color-regular);
  }

  .right {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    flex-grow: 0;
    justify-self: right;
    height: 100%;
    gap: 2px;
  }

  :deep(.list-parent) {
    height: 100%;
  }

  // 标签 chip 化：圆角小胶囊，选中实心主题色白字
  :deep(.list) {
    display: flex;
    height: 100%;
    align-items: center;
    width: max-content;
    gap: 6px;
    padding: 0 8px;

    .item {
      height: 28px;
      align-items: center;
      display: flex;
      gap: 6px;
      padding: 0 13px;
      flex-shrink: 0;
      flex-grow: 0;
      position: relative;
      border-radius: 6px;
      background-color: var(--el-fill-color-light);
      border: 1px solid var(--el-border-color-lighter);
      font-size: 12.5px;
      color: var(--el-text-color-regular);
      transition: all 0.2s;

      // 设计稿 .tag .dot：6px 圆点、currentColor 70% 透明（选中态白点）
      .dot {
        display: none;
        position: absolute;
        left: 6px;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: currentColor;
        opacity: 0.85;
        pointer-events: none;
      }

      .del-icon {
        width: 12px;
        height: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        line-height: 1;
        opacity: 0.6;
        transition:
          opacity 0.2s,
          transform 0.2s;
        margin-right: -6px;
      }

      .del-icon:hover {
        opacity: 1;
        transform: scale(1.1);
      }
    }

    .item:hover {
      color: var(--el-color-primary);
      border-color: rgba(var(--el-color-primary-rgb), 0.3);
    }

    .item.active,
    .item.active:hover {
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);
      color: var(--el-color-white);
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(var(--el-color-primary-rgb), 0.18);

      .dot {
        display: block;
      }
    }
  }
}
</style>
