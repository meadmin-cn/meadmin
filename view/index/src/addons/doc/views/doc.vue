<template>
  <layout v-loading="loading">
    <div :id="viewId" class="view-md">
      <MdPreview :id="mdviewId" class="view" :model-value="data?.mdContent || ''" />
      <MdCatalog class="catalog" :editor-id="mdviewId" :scroll-element="'#' + viewId" />
    </div>
  </layout>
</template>

<script setup lang="ts" name="Doc">
import { MdCatalog, MdPreview } from 'meadmin-addons-doc';
import 'meadmin-addons-doc/dist/preview.js';
import { aonDocGetContentApi, AonDocMenuTree, aonDocmenuTreeApi } from '../api/aonDoc';
import Layout from './components/index.vue';
const props = defineProps<{
  aonDocType?: string;
  aonDocLabel?: string; //文档标识（文档id）
}>();
const router = useRouter();
const { runAsync: menuApiRun } = aonDocmenuTreeApi();
const { runAsync, data, loading } = aonDocGetContentApi();
const viewId = 'view-md_' + useId();
const mdviewId = 'mdp_' + useId();
if (!props.aonDocLabel) {
  const menus = await menuApiRun();
  const getFirstMenu = (menus: AonDocMenuTree) => {
    let menu = '/';
    for (let i = 0; i < menus.length; i++) {
      if (menus[i].children?.length) {
        menu = getFirstMenu(menus[i].children);
      } else if (menus[i].contentType === 0) {
        return `/aon/doc/main/${menus[i].id}`;
      }
    }
    return menu;
  };
  router.replace(getFirstMenu(menus));
} else {
  await runAsync(props.aonDocLabel!);
}
watch(
  () => props.aonDocLabel,
  async () => {
    await runAsync(props.aonDocLabel!);
  },
);
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
}
</style>
