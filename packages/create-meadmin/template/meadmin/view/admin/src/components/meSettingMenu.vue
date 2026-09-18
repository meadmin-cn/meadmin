<template>
  <el-drawer v-model="setting.showSettingMenu" :title="$t('项目配置')" size="340px" append-to-body>
    <el-form class="content" label-position="left" label-width="170px">
      <div class="title">
        <div class="title-content">{{ $t('布局') }}</div>
      </div>
      <div class="info" :style="{ '--primaryColor': themeConfig.primaryColor }">
        <div class="layout-option" :class="{ active: themeConfig.menuType === 'sidebar' }" :title="$t('左侧菜单模式')" @click="setMenuType('sidebar')">
          <div class="layout-base layout-left"></div>
          <div class="layout-label">{{ $t('左侧模式') }}</div>
        </div>
        <div class="layout-option" :class="{ active: themeConfig.menuType === 'top' }" :title="$t('顶部菜单模式')" @click="setMenuType('top')">
          <div class="layout-base layout-top"></div>
          <div class="layout-label">{{ $t('顶部模式') }}</div>
        </div>
        <div class="layout-option" :class="{ active: themeConfig.menuType === 'mix' }" :title="$t('头部+左侧混合模式')" @click="setMenuType('mix')">
          <div class="layout-base layout-mix"></div>
          <div class="layout-label">{{ $t('头部+左侧混合') }}</div>
        </div>
      </div>
      <div class="title">
        <div class="title-content">{{ $t('配置') }}</div>
      </div>
      <el-form-item :label="$t('主题色')">
        <el-color-picker v-model="themeConfig.primaryColor" :predefine="predefinePrimaryColors" />
      </el-form-item>
      <el-form-item :label="$t('侧边栏背景色')">
        <el-color-picker v-model="themeConfig.menuBg" :predefine="sidebarBgColors" />
      </el-form-item>
      <el-form-item :label="$t('折叠侧边栏')">
        <el-switch v-model="themeConfig.menuCollapse"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('侧边栏展开宽度')">
        <el-input v-model="themeConfig.menuWidth"></el-input>
      </el-form-item>
      <el-form-item :label="$t('固定') + $t(' ') + $t('Header')">
        <el-switch v-model="themeConfig.fixedHeader"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('顶栏')">
        <el-switch v-model="themeConfig.topBar"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('菜单') + $t(' ') + $t('搜索')">
        <el-switch v-model="themeConfig.showSearchMenu"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('模式') + $t(' ') + $t('切换')">
        <el-switch v-model="themeConfig.showDark"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('Size') + $t(' ') + $t('切换')">
        <el-switch v-model="themeConfig.showSize"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('面包屑')">
        <el-switch v-model="themeConfig.breadcrumb"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('标签栏')">
        <el-switch v-model="themeConfig.tagBar"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('标签栏') + $t(' ') + $t('刷新') + $t(' ') + $t('按钮')">
        <el-switch v-model="themeConfig.tagBarRefresh"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('标签栏') + $t(' ') + $t('菜单') + $t(' ') + $t('按钮')">
        <el-switch v-model="themeConfig.tagBarMenu"></el-switch>
      </el-form-item>
      <el-button style="width: 100%" @click="Object.assign(themeConfig, origionThemeConfig)">{{ $t('重置') }} </el-button>
      <el-button style="width: 100%; margin: 10px 0" type="danger" @click="clear"> {{ $t('清除缓存') }}{{ $t(' ') }}{{ $t('并') }}{{ $t(' ') }}{{ $t('退出登录') }} </el-button>
    </el-form>
  </el-drawer>
</template>
<script lang="ts" setup name="MeSettingMenu">
import { themeConfig as origionThemeConfig } from '@/config';
import { useSettingStore, useUserStore } from '@/store';
const setting = useSettingStore();
const { themeConfig } = storeToRefs(setting);
const userStore = useUserStore();
const predefinePrimaryColors = reactive(['#2B5CFF', '#409EFF', '#1890FF', '#304156', '#212121', '#11A983', '#13C2C2', '#6959CD', '#F5222D']);
const sidebarBgColors = reactive(['#101233', '#1d1e1f', '#212121', '#273352', '#ffffff', '#191b24', '#191a23', '#304156', '#001628']);
const setMenuType = (type: 'sidebar' | 'top' | 'mix') => {
  themeConfig.value.menuType = type;
  if (type === 'mix') {
    themeConfig.value.menuCollapse = false;
  }
};
const clear = () => {
  setting.clearCache();
  userStore.logOut();
};
</script>
<style lang="scss" scoped>
.content {
  margin-top: -32px;
  .title {
    display: block;
    height: 1px;
    width: 100%;
    margin: 24px 0;
    border-top: 1px var(--el-border-color) var(--el-border-style);
    position: relative;
    .title-content {
      position: absolute;
      background-color: var(--el-bg-color);
      padding: 0 20px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      font-size: 14px;
      left: 50%;
      transform: translate(-50%) translateY(-50%);
    }
  }
  .info {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
    .layout-option {
      flex: 1;
      min-width: 0;
      cursor: pointer;
    }
    .layout-base {
      height: 64px;
      border-radius: 8px;
      position: relative;
      background: #f6f8fc;
      border: 2px solid #e6eaf3;
      overflow: hidden;
      transition:
        border-color 0.2s,
        box-shadow 0.2s;
    }
    .layout-label {
      margin-top: 7px;
      text-align: center;
      color: var(--el-text-color-regular);
      font-size: 11.5px;
      line-height: 1.25;
      word-break: keep-all;
    }
    .layout-option.active {
      .layout-base {
        border-color: var(--primaryColor) !important;
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--primaryColor) 14%, transparent);
      }
      .layout-label {
        color: var(--primaryColor);
        font-weight: 700;
      }
      .layout-base::after {
        content: '✓';
        position: absolute;
        right: 4px;
        bottom: 3px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primaryColor);
        color: #fff;
        font-size: 10px;
        font-weight: 800;
        z-index: 2;
      }
    }
    .layout-left::before {
      content: '';
      background-color: #101233;
      position: absolute;
      left: 0;
      width: 26%;
      top: 0;
      bottom: 0;
    }
    .layout-left::after {
      content: '';
      background-color: #fff;
      position: absolute;
      left: 26%;
      right: 0;
      top: 0;
      height: 22%;
      border-bottom: 1px solid #e3e8f2;
    }
    .layout-top::before {
      content: none;
    }
    .layout-top::after {
      content: '';
      background-color: #fff;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 22%;
      border-bottom: 1px solid #e3e8f2;
    }
    .layout-mix::before {
      content: '';
      background-color: #fff;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 22%;
      border-bottom: 1px solid #e3e8f2;
    }
    .layout-mix::after {
      content: '';
      background-color: #101233;
      position: absolute;
      left: 0;
      width: 30%;
      top: 22%;
      bottom: 0;
    }
  }
}
</style>
