<template>
  <!-- 列表左侧栏目树：文章 / 单页 / 自定义表单三处列表共用，按「可关联类型」决定哪些栏目能选 -->
  <div class="cms-category-workspace">
    <aside class="cms-category-panel">
      <div class="cms-category-header">
        <span>{{ title }}</span>
        <el-button v-if="current" link type="primary" @click="emit('select', undefined)">{{ t('全部') }}</el-button>
      </div>
      <el-tree :data="tree" node-key="id" :props="{ label: 'title', children: 'children', disabled: 'disabled' }" default-expand-all highlight-current :current-node-key="current ?? undefined" empty-text="暂无可关联栏目" @node-click="onNodeClick">
        <template #default="{ data }">
          <span class="cms-category-node" :class="{ 'is-disabled': data.disabled }" :title="data.disabled ? cmsCategoryDisabledTip(data.type) : data.title">
            <span class="cms-category-node-title">{{ data.title }}</span>
            <span v-if="data.disabled" class="cms-category-node-type">{{ cmsCategoryTypeLabel(data.type) }}</span>
          </span>
        </template>
      </el-tree>
    </aside>
    <section class="cms-category-main"><slot /></section>
  </div>
</template>
<script setup lang="ts">
import { useLocalesI18n } from '@/locales/i18n';
import { computed } from 'vue';
import { cmsCategoryTypeLabel, type CmsCategoryInfo } from '../api/category';
import { cmsCategoryDisabledTip, markCategoryTree, type CmsCategoryTreeNode } from './categoryTree';
const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'cms']);
const props = withDefaults(defineProps<{ categories?: CmsCategoryInfo[]; allowTypes: readonly number[]; current?: string; title?: string }>(), { title: '栏目' });
const emit = defineEmits<{ select: [string | undefined] }>();
// 不要在 setup 里 await 语言包：顶层 await 会让组件变成异步组件，弹窗/列表内容失去响应式更新
void loadRes;
const tree = computed(() => markCategoryTree(props.categories, props.allowTypes));
// 置灰节点（如单页/外链/自定义表单型栏目）不能承载当前内容，点击直接忽略
const onNodeClick = (data: CmsCategoryTreeNode) => {
  if (data.disabled) return;
  emit('select', data.id);
};
</script>
<style scoped>
/* 工作区占满内容卡片高度，列表与栏目各自内部滚动，避免整页滚动导致头部错位 */
.cms-category-workspace {
  display: grid;
  grid-template-columns: 236px minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  gap: 16px;
  height: 100%;
  min-width: 0;
}
.cms-category-panel,
.cms-category-main {
  min-width: 0;
  min-height: 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
}
.cms-category-panel {
  overflow: auto;
  padding: 12px 10px;
}
.cms-category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 6px 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-primary);
  font-weight: 600;
}
.cms-category-panel :deep(.el-tree-node__content) {
  height: 34px;
  margin: 2px 0;
  padding-right: 6px;
  border-radius: 6px;
}
.cms-category-panel :deep(.el-tree-node__content:hover),
.cms-category-panel :deep(.is-current > .el-tree-node__content) {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}
.cms-category-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}
.cms-category-node-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cms-category-node.is-disabled {
  cursor: not-allowed;
  color: var(--el-text-color-placeholder);
}
.cms-category-node-type {
  flex: none;
  padding: 0 6px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-light);
  border-radius: 999px;
}
/* 不能设置 overflow:hidden，否则表格工具栏「列设置」等内嵌浮层会被裁切；改为靠高度约束避免溢出 */
.cms-category-main {
  display: flex;
  flex-direction: column;
  padding: 6px 14px 14px;
}
@media (max-width: 900px) {
  /* 窄屏下高度有限，改为整页滚动，列表不再内部限高 */
  .cms-category-workspace {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    height: auto;
    min-height: 100%;
  }
  .cms-category-panel {
    max-height: 240px;
  }
}
</style>
