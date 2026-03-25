<template>
  <me-dialog v-model="show" :loading="loading" style="height: calc(80vh - 300px)" :title="t('预览')" :close-on-click-modal="false" body-class=" md-view-body" @closed="emit('closed')">
    <div :id="viewId" class="view-md">
      <MdPreview :id="mdviewId" class="view" :model-value="data?.mdContent" />
      <MdCatalog class="catalog" :editor-id="mdviewId" :scroll-element="'#' + viewId" />
    </div>
  </me-dialog>
</template>

<script setup lang="ts" name="ViewMd">
// preview.css相比style.css少了编辑器那部分样式
import { aonDocInfoApi } from '@/addons/doc/api/doc.js';
import { useLocalesI18n } from '@/locales/i18n.js';
import { MdCatalog, MdPreview } from 'meadmin-addons-doc';
import 'meadmin-addons-doc/dist/preview.js';
const viewId = 'view-md_' + useId();
const mdviewId = 'mdp_' + useId();
const show = defineModel<boolean>();
const emit = defineEmits<{
  (e: 'closed'): void;
}>();
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'aonDoc']);
await Promise.all([loadRes]);
const props = defineProps<{ id: string }>();
const { data, loading, runAsync } = aonDocInfoApi();
watch(
  () => props.id,
  async (id?: string) => {
    if (id) {
      runAsync(id);
    }
  },
  { immediate: true },
);
</script>
<style lang="scss" scoped>
:global(.md-view-body) {
  position: relative;
}
.view-md {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  overflow: auto;
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
