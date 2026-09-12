<template>
  <div v-if="menus.length" class="layout-menu" :class="{ 'has-title': menuType === 'sidebar' || globalStore.isMobile, 'has-expand': menuType !== 'sidebar' && !globalStore.isMobile, 'collapse': !globalStore.isMobile && themeConfig.menuCollapse }">
    <div v-if="menuType !== 'sidebar' && !globalStore.isMobile" class="side-foot" @click="toggleCollapse">
      <!-- 设计稿 .collapse-btn：« 收起 / » 展开（双尖括号） -->
      <mel-icon-d-arrow-left v-if="!themeConfig.menuCollapse" class="collapse-icon"></mel-icon-d-arrow-left>
      <mel-icon-d-arrow-right v-else class="collapse-icon"></mel-icon-d-arrow-right>
    </div>
    <Title v-else class="layout-title"></Title>
    <div class="menu-box">
      <el-scrollbar view-class="layout-menu-content">
        <el-menu class="el-menu-vertical-demo" :default-active="activeMenu" :collapse="!globalStore.isMobile && themeConfig.menuCollapse" :collapse-transition="false">
          <menu-item v-for="item in menus" :key="item.path" :item="item" />
        </el-menu>
      </el-scrollbar>
    </div>
  </div>
</template>
<script setup lang="ts" name="layoutMenu">
import { useGlobalStore, useRouteStore, useSettingStore } from '@/store';
import { getColorLuma, mixColor } from '@/utils/helper';
import type { RouteRecordRaw } from 'vue-router';
import Title from '../title.vue';
import menuItem from './components/menuItem.vue';
const { themeConfig, menuType } = storeToRefs(useSettingStore());
const routeStore = useRouteStore();
const globalStore = useGlobalStore();
const route = useRoute();
let activeMenu = ref('');
watch(
  route,
  (route) => {
    if (route.meta) {
      if (route.meta.hideMenu) {
        if (route.meta.activeMenu) {
          activeMenu.value = route.meta.activeMenu;
        }
      } else {
        activeMenu.value = route.path;
      }
    }
  },
  { immediate: true },
);
const toggleCollapse = () => {
  themeConfig.value.menuCollapse = !themeConfig.value.menuCollapse;
};
const menuBg1 = computed(() => mixColor(themeConfig.value.menuBg, getColorLuma(themeConfig.value.menuBg) < 100 ? '#ffffff' : '#303133', 0.1));
const menuActiveColor = computed(() => (getColorLuma(themeConfig.value.menuBg) < 100 ? '#ffffff' : '#303133'));
const menuTextColor = computed(() => mixColor(themeConfig.value.menuBg, menuActiveColor.value, 0.8));
// 取一级菜单的可见子菜单;无可见子菜单(叶子一级菜单,如「控制台」)时返回其自身,保证侧栏不为空
const visibleChilds = (top: RouteRecordRaw | undefined): RouteRecordRaw[] => {
  if (!top || !top.meta || top.meta.hideMenu) {
    return [];
  }
  const visible = top.children?.filter((v) => v.meta && !v.meta.hideMenu) ?? [];
  return visible.length ? visible : [top];
};
const menus = computed(() => {
  // 移动抽屉展示完整菜单树（设计稿 v1.4）
  if (menuType.value === 'sidebar' || globalStore.isMobile) {
    return routeStore.routes;
  }
  // mix/top 模式:侧栏渲染当前一级菜单下的二级子菜单
  const idx = route.meta?.menuIndex?.[0];
  if (idx != null) {
    const list = visibleChilds(routeStore.routes[idx]);
    if (list.length) {
      return list;
    }
  }
  // 兜底:按 path 第一段匹配顶级菜单(如 /system/user -> 顶级 /system)
  const segments = (route.path || '').split('/').filter(Boolean);
  const topSeg = '/' + segments[0];
  return visibleChilds(routeStore.routes.find((r) => r.path === topSeg));
});
</script>
<style lang="scss" scoped>
.layout-menu {
  --el-menu-base-level-padding: 14px;
  --el-menu-level-padding: 14px;
  --el-menu-text-color: v-bind('menuTextColor');
  --el-menu-active-color: v-bind('menuActiveColor');
  background-color: v-bind('themeConfig.menuBg');
  height: 100%;
  position: relative;

  :deep(.horizontal-collapse-transition),
  :deep(.horizontal-collapse-transition .el-sub-menu__title),
  :deep(.collapse-transition),
  :deep(.el-collapse-transition-enter-active),
  :deep(.el-collapse-transition-leave-active) {
    transition: none !important;
  }

  .layout-title {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    z-index: 2;
    color: var(--el-menu-active-color);
    width: 100%;
    box-shadow: 0 1px v-bind(menuBg1);
  }
  .menu-box {
    height: 100%;
    // 菜单内容永不出现横向滚动条（收起态宽度对齐后兜底）
    :deep(.el-scrollbar__wrap) {
      overflow-x: hidden;
    }
    :deep(.layout-menu-content) {
      width: v-bind('themeConfig.menuWidth');
      color: var(--el-menu-text-color);
      contain: layout paint;
      transition: width 0.22s cubic-bezier(0.2, 0, 0, 1);
      // 设计稿 v1.4 .smenu：padding 12px 12px 8px（上12 左右12 下8）
      padding: 12px 12px 8px;
      box-sizing: border-box;

      .menu {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-all;
      }

      .el-menu {
        background-color: unset;
        border: 0;

        // 收起宽度固定 64px（Element 标准），与 .collapse 容器一致；
        // 不能用 var calc：Element 在 .el-menu 本体上定义了 --el-menu-base-level-padding:20px，ancestor 覆盖无效
        &.el-menu--collapse {
          width: 64px;
          transition: none;
        }

        .el-sub-menu.is-active {
          > .el-sub-menu__title {
            background-color: color-mix(in srgb, var(--el-menu-active-color) 10%, transparent);
            color: var(--el-menu-active-color);
            font-weight: 600;
          }
        }
        .el-sub-menu__title {
          padding-right: 28px;
        }
        // 设计稿 .grp .arrow：实心小三角，闭合 ▸（右指），展开旋转 90° 为 ▾
        .el-sub-menu__title .el-sub-menu__icon-arrow {
          width: 0;
          height: 0;
          border: 4.5px solid transparent;
          border-left-color: color-mix(in srgb, var(--el-menu-text-color) 75%, transparent);
          top: 17px;
          margin-top: 0;
          transform: translateY(-50%);
          transition: transform 0.25s;
          svg {
            display: none;
          }
        }
        .el-sub-menu.is-opened > .el-sub-menu__title .el-sub-menu__icon-arrow {
          // el-sub-menu 组件给箭头写了内联 transform: rotateZ(180deg)，必须 !important 才能覆盖
          transform: translateY(-50%) rotate(90deg) !important;
          border-left-color: var(--el-menu-active-color);
        }
        // 设计稿 .leaf:hover / .grp:hover：白色 6% 微光 + 文字高亮（深色菜单为白字，浅色菜单自动反色）
        .el-sub-menu__title:hover,
        .el-menu-item:hover {
          background-color: color-mix(in srgb, var(--el-menu-active-color) 6%, transparent);
          color: var(--el-menu-active-color);
        }

        .el-menu-item.is-active {
          background-color: var(--el-color-primary);
          color: var(--el-color-white);
        }

        // 设计稿 .sub：展开子菜单无衬底（仅缩进），子项直接落在菜单底色上
        .el-menu--inline {
          background-color: transparent;
          .el-menu-item,
          .el-sub-menu__title {
            background-color: transparent;
          }
          .el-sub-menu.is-active > .el-sub-menu__title {
            background-color: color-mix(in srgb, var(--el-menu-active-color) 10%, transparent);
            color: var(--el-menu-active-color);
            font-weight: 600;
          }
          .el-menu-item.is-active {
            background-color: var(--el-color-primary);
            color: var(--el-color-white);
          }
        }

        // 设计稿 .ic：图标 16×16、与文字 gap 10px、首行对齐 margin-top 1px（排除展开箭头，箭头用实心三角）
        .el-menu-item,
        .el-sub-menu {
          .el-icon:not(.el-sub-menu__icon-arrow),
          > svg,
          .default-icon {
            width: 16px;
            height: 16px;
            font-size: 16px;
            margin-left: 0;
            margin-right: 10px;
          }
        }
      }
    }
  }
  // 底部折叠栏（设计稿 .side-foot）：padding 10px 12px + 按钮 32px、上边框
  .side-foot {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px 12px;
    border-top: 1px solid v-bind(menuBg1);
    background-color: v-bind('themeConfig.menuBg');
    z-index: 1;
    cursor: pointer;
    .collapse-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 32px;
      border-radius: 8px;
      color: var(--el-menu-text-color);
      font-size: 15px;
    }
    &:hover .collapse-icon {
      background-color: rgba(255, 255, 255, 0.06);
      color: var(--el-menu-active-color);
    }
  }

  // 展开状态下：菜单项圆角胶囊，长文字自动换行（无限极层级均适用）
  &:not(.collapse) {
    .menu-box :deep(.layout-menu-content) .el-menu {
      // 菜单项垂直间距 6px（相邻兄弟 margin 塌陷后生效 6px）：hover 项与相邻选中胶囊之间留有呼吸感
      .el-menu-item,
      .el-sub-menu__title {
        margin: 6px 0;
        border-radius: 8px;
        height: auto;
        min-height: 34px;
        line-height: 1.35;
        padding-top: 8px;
        padding-bottom: 8px;
        align-items: flex-start;
      }
      // 叶子项字号 13px、分组项 13.5px（设计稿 .leaf 13px / .grp 13.5px）
      .el-menu-item {
        font-size: 13px;
      }
      .el-sub-menu__title {
        font-size: 13.5px;
      }
      // 图标与首行文字对齐（长文字换行时图标不垂直居中）
      .el-menu-item > .el-icon,
      .el-sub-menu__title > .el-icon,
      .el-menu-item > svg,
      .el-sub-menu__title > svg,
      .el-menu-item > .default-icon,
      .el-sub-menu__title > .default-icon {
        margin-top: 1px;
      }
      // 展开箭头按整项高度垂直居中，菜单名换行时不贴近第一行
      .el-sub-menu__title .el-sub-menu__icon-arrow {
        top: 17px;
        margin-top: 0;
      }
      // 覆盖默认的 nowrap 省略号，长文字换行展示
      .menu {
        white-space: normal;
        overflow: visible;
        text-overflow: clip;
      }
      // 选中胶囊：实心主题色 + 柔和投影（设计稿 0 6px 14px rgba(43,92,255,.4)）
      .el-menu-item.is-active {
        font-weight: 600;
        box-shadow: 0 6px 14px rgba(var(--el-color-primary-rgb), 0.4);
      }
    }
  }
}
.has-title {
  padding-top: $header-top-height;

  @media (max-width: 768px) {
    padding-top: 50px;
  }
}
.has-expand {
  .menu-box {
    padding-bottom: 52px;
    box-sizing: border-box;
  }
}
.layout-menu.collapse {
  :deep(.horizontal-collapse-transition),
  :deep(.horizontal-collapse-transition .el-sub-menu__title),
  :deep(.collapse-transition),
  :deep(.el-collapse-transition-enter-active),
  :deep(.el-collapse-transition-leave-active) {
    transition: none !important;
  }

  :deep(.el-menu--collapse .el-menu--inline),
  :deep(.el-menu--collapse .el-menu--inline .el-menu-item),
  :deep(.el-menu--collapse .el-menu--inline .el-sub-menu__title) {
    display: none !important;
  }

  :deep(.el-menu--collapse > .el-menu-item > svg),
  :deep(.el-menu--collapse > .el-sub-menu > .el-sub-menu__title > .el-icon:not(.el-sub-menu__icon-arrow)),
  :deep(.el-menu--collapse > .el-sub-menu > .el-sub-menu__title > svg),
  :deep(.el-menu--collapse > .el-menu-item > .default-icon),
  :deep(.el-menu--collapse > .el-sub-menu > .el-sub-menu__title > .default-icon) {
    position: absolute !important;
    left: 50% !important;
    top: 50% !important;
    width: 18px !important;
    height: 18px !important;
    margin: 0 !important;
    transform: translate(-50%, -50%) !important;
  }

  :deep(.el-menu--collapse > .el-sub-menu > .el-sub-menu__title > .el-icon:not(.el-sub-menu__icon-arrow) > svg),
  :deep(.el-menu--collapse > .el-menu-item > .el-menu-tooltip__trigger > .el-icon > svg) {
    width: 18px !important;
    height: 18px !important;
  }

  :deep(.el-menu--collapse > .el-menu-item > .el-menu-tooltip__trigger) {
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
  }

  :deep(.el-menu--collapse > .el-menu-item > .el-menu-tooltip__trigger > .el-icon),
  :deep(.el-menu--collapse > .el-menu-item > .el-menu-tooltip__trigger > svg),
  :deep(.el-menu--collapse > .el-menu-item > .el-menu-tooltip__trigger > .default-icon) {
    width: 18px !important;
    height: 18px !important;
    margin: 0 !important;
    transform: none !important;
  }

  .menu-box :deep(.layout-menu-content) {
    width: 64px !important;
    padding: 0 !important;
    // 收起态菜单项 4px 内收 + 圆角：选中蓝胶囊不贴边，与展开态视觉语言一致
    .el-menu-item,
    .el-sub-menu__title {
      width: calc(100% - 8px);
      min-width: 0;
      height: 42px;
      line-height: 42px;
      margin: 4px;
      padding: 0 !important;
      border-radius: 8px;
      justify-content: center;
      box-sizing: border-box;
      background-color: transparent;
      position: relative;
    }
    .el-menu--collapse > .el-menu-item,
    .el-menu--collapse > .el-sub-menu > .el-sub-menu__title {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .el-menu--inline {
      display: none;
    }
    .el-menu--collapse .el-menu--inline,
    .el-menu--collapse .el-menu--inline .el-menu-item,
    .el-menu--collapse .el-menu--inline .el-sub-menu__title {
      display: none !important;
    }
    .el-menu-item.is-active,
    .el-sub-menu.is-active > .el-sub-menu__title {
      background-color: rgba(var(--el-color-primary-rgb), 0.95);
      color: var(--el-color-white);
      box-shadow: 0 6px 14px rgba(var(--el-color-primary-rgb), 0.32);
    }
    .el-menu--collapse > .el-menu-item > .el-icon,
    .el-menu--collapse > .el-sub-menu > .el-sub-menu__title > .el-icon,
    .el-menu--collapse > .el-menu-item > svg,
    .el-menu--collapse > .el-sub-menu > .el-sub-menu__title > svg,
    .el-menu--collapse > .el-menu-item > .default-icon,
    .el-menu--collapse > .el-sub-menu > .el-sub-menu__title > .default-icon {
      position: absolute !important;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) !important;
      flex: 0 0 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .el-menu-item > .el-icon:not(.el-sub-menu__icon-arrow),
    .el-sub-menu__title > .el-icon:not(.el-sub-menu__icon-arrow),
    .el-menu-item > svg,
    .el-sub-menu__title > svg,
    .el-menu-item > .default-icon,
    .el-sub-menu__title > .default-icon {
      position: absolute !important;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .el-menu-item > .el-icon,
    .el-sub-menu__title > .el-icon,
    .el-menu-item > svg,
    .el-sub-menu__title > svg,
    .el-menu-item > .default-icon,
    .el-sub-menu__title > .default-icon {
      width: 18px;
      height: 18px;
      font-size: 18px;
      margin: 0 !important;
    }
    .el-icon:not(.el-sub-menu__icon-arrow) {
      margin-right: 0 !important;
    }
    .el-sub-menu__icon-arrow {
      display: none !important;
    }
    span {
      opacity: 0;
    }
    // .title {
    //   width: calc(var(--el-menu-icon-width) + var(--el-menu-base-level-padding) * 2);
    //   text-align: center;
    //   margin: 0;

    //   span {
    //     display: none;
    //   }
    // }
  }
}
</style>
