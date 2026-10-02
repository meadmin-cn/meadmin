<template>
  <!-- 列表里的可复制访问地址：单元格只展示路径（同源时省略域名），复制与悬浮提示始终使用完整地址 -->
  <div class="cms-access-url" :class="{ 'is-muted': muted }">
    <template v-if="url">
      <el-tooltip placement="top-start" effect="light" :content="tip" :show-after="120">
        <span class="cms-access-url-text">{{ text }}</span>
      </el-tooltip>
      <el-button link class="cms-access-url-act" :icon="CopyDocument" :title="t('复制访问地址')" @click="onCopy" />
      <el-button link class="cms-access-url-act" :icon="Link" :title="t('新窗口打开')" @click="onOpen" />
    </template>
    <span v-else class="cms-access-url-empty">{{ empty || '-' }}</span>
  </div>
</template>
<script setup lang="ts">
import { useLocalesI18n } from '@/locales/i18n';
import { CopyDocument, Link } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed } from 'vue';
import { cmsFrontRoot, copyText } from './accessUrl';
const { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'cms']);
// 不要在 setup 里 await 语言包：顶层 await 会让组件变成异步组件，未用 Suspense 包裹时列表单元格失去响应式更新
void loadRes;
const props = defineProps<{ url?: string; muted?: boolean; empty?: string }>();
const text = computed(() => {
  const url = props.url ?? '';
  const root = cmsFrontRoot();
  return root && url.startsWith(root) ? url.slice(root.length) || '/' : url;
});
const tip = computed(() => (props.muted ? `${props.url}（启用后前台才可访问）` : (props.url ?? '')));
const onCopy = async () => {
  const ok = await copyText(props.url ?? '');
  if (ok) ElMessage.success(t('访问地址已复制'));
  else ElMessage.warning(t('复制失败，请手动复制'));
};
const onOpen = () => {
  if (props.url) window.open(props.url, '_blank', 'noopener');
};
</script>
<style scoped>
.cms-access-url {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 2px;
}
/* 长地址在单元格内单行省略，完整地址由悬浮提示与复制按钮承载 */
.cms-access-url-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--el-color-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cms-access-url.is-muted .cms-access-url-text {
  color: var(--el-text-color-placeholder);
}
.cms-access-url-act {
  flex: none;
  height: auto;
  padding: 0 3px;
  font-size: 14px;
}
.cms-access-url-empty {
  color: var(--el-text-color-placeholder);
}
</style>
