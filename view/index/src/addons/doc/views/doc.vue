<template>
  <layout v-loading="loading">
    <div :id="viewId" class="view-md">
      <MdPreview :id="mdviewId" class="view" :model-value="data?.mdContent || ''" />
      <MdCatalog class="catalog" :editor-id="mdviewId" :scroll-element="'#' + viewId" />
    </div>
  </layout>
</template>

<script setup lang="ts" name="Doc">
import { MdCatalog, MdPreview } from 'meadmin-addons-doc/dist/preview.js';
import type { AonDocMenuTree } from '../api/aonDoc';
import { aonDocGetContentApi, aonDocmenuTreeApi } from '../api/aonDoc';
import Layout from './components/pageLayout.vue';
const props = defineProps<{
  version?: string;
  aonDocLabel?: string; //文档标识（文档id）
}>();
const router = useRouter();
const { runAsync: menuApiRun } = aonDocmenuTreeApi();
const { runAsync, data, loading } = aonDocGetContentApi();
const viewId = 'view-md_' + useId();
const mdviewId = 'mdp_' + useId();
const getFirstMenu = (menus: AonDocMenuTree): AonDocMenuTree[number] | undefined => {
  for (const menu of menus) {
    if (menu.children?.length) {
      const first = getFirstMenu(menu.children);
      if (first) return first;
    } else if (menu.contentType === 0) {
      return menu;
    }
  }
};
let loadedKey = '';
let defaultTarget: { version: string; label: string } | undefined;
const init = async (navigate = false) => {
  const requestedVersion = props.version;
  const requestedLabel = props.aonDocLabel;
  let version = requestedVersion;
  let label = requestedLabel;
  if (!label) {
    if (!defaultTarget || (version && defaultTarget.version !== version)) {
      const first = getFirstMenu(await menuApiRun(version));
      // 空菜单或只有外链时保持入口，不误跳到首页。
      if (!first) return;
      defaultTarget = { version: first.version, label: first.label || first.id };
    }
    ({ version, label } = defaultTarget);
  }
  if (props.version !== requestedVersion || props.aonDocLabel !== requestedLabel) return;
  if (!version || !label) return;
  const key = `${version}/${label}`;
  if (loadedKey !== key) {
    await runAsync(version, label);
    loadedKey = key;
  }
  // 初次 SSR/水合先加载正文；挂载并注册监听后才规范化地址，避免漏掉参数变化。
  if (navigate && !requestedLabel && props.version === requestedVersion && props.aonDocLabel === requestedLabel) {
    await router.replace(`/aon/doc/${encodeURIComponent(version)}/${encodeURIComponent(label)}`);
  }
};
onMounted(() => {
  watch(
    () => [props.aonDocLabel, props.version],
    () => init(true),
    { immediate: true },
  );
});
await init();
</script>
<style lang="scss" scoped>
.view-md {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  overflow: auto;
  background-color: #fff;
  padding: 5px 15px;
  .view {
    width: 80%;
  }
  .catalog {
    top: 0;
    width: 20%;
    height: 100%;
    position: sticky;
    top: 0;
    overflow-y: auto;
  }
  /* 手机端：隐藏右侧快捷定位目录，文档内容全宽 */
  @media (max-width: 960px) {
    .view {
      width: 100%;
    }
    .catalog {
      display: none;
    }
  }
}
</style>
