<template>
  <div class="doc-header-right" :class="{ mobile }">
    <el-dropdown v-if="versions.length" class="version" trigger="click" @command="toVersion">
      <span class="version-current">
        {{ currentTitle }}
        <mel-icon-arrow-down class="el-icon--right" />
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="item in versions" :key="item.code" :command="item.code">{{ item.title }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <a v-for="item in config?.links" :key="item.url" class="right-link" :href="item.url" target="_blank" rel="noopener">
      <img v-if="item.icon?.url" :src="item.icon.url" class="icon" />
      {{ item.title }}
    </a>
  </div>
</template>

<script setup lang="ts" name="AonDocHeaderRight">
import type { AonDocConfigInfo } from '../../api/aonDoc';

// doc 插件头部右侧扩展区：版本切换 + 配置外链，用于替换主 layout 头部默认的“更新日志”
const props = withDefaults(
  defineProps<{
    config?: AonDocConfigInfo; //文档配置
    version?: string; //当前版本标识
    mobile?: boolean; //移动端折叠菜单内使用（纵向排列）
  }>(),
  { version: '', mobile: false },
);

const router = useRouter();

const versions = computed(() => props.config?.version.filter((item) => item.status === 1) ?? []);
const currentTitle = computed(() => props.config?.version.find((v) => v.code === props.version)?.title || versions.value[0]?.title || '');

const toVersion = (code: string) => {
  if (code && code !== props.version) {
    router.push(`/aon/doc/${code}/`);
  }
};
</script>

<style lang="scss" scoped>
.doc-header-right {
  display: flex;
  align-items: center;
  gap: 4px;
  /* 各项之间：右侧黑色竖线分隔（最后一项不加） */
  > * {
    position: relative;
    &::after {
      content: '';
      position: absolute;
      right: -2px;
      top: 50%;
      width: 1px;
      height: 18px;
      transform: translateY(-50%);
      background: #181c28;
    }
    &:last-child::after {
      display: none;
    }
  }
  .version {
    display: flex;
    align-items: center;
    .version-current {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 9px 12px;
      font-size: 14.5px;
      font-weight: 500;
      color: #454b5c;
      border-radius: 8px;
      cursor: pointer;
      white-space: nowrap;
      transition: 0.2s;
      outline: none;
      &:hover {
        color: #2b5cff;
        background: #f6f8fc;
      }
    }
  }
  .right-link {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 9px 12px;
    font-size: 14.5px;
    font-weight: 500;
    color: #454b5c;
    border-radius: 8px;
    white-space: nowrap;
    transition: 0.2s;
    &:hover {
      color: #2b5cff;
      background: #f6f8fc;
    }
    .icon {
      width: 22px;
      height: 22px;
    }
  }
  /* 移动端折叠菜单内：纵向排列 */
  &.mobile {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #e8ebf2;
    /* 纵向排列不需要竖线分隔 */
    > *::after {
      display: none;
    }
    .version-current,
    .right-link {
      padding: 12px;
      font-size: 16px;
      color: #2b5cff;
    }
  }
}
</style>
