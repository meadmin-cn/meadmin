<template>
  <me-dialog v-model="show" :title="t('预览')" :close-on-click-modal="false" @closed="emit('closed')">
    <div :id="viewId" class="view-md">
      <MdPreview :id="id" :model-value="text" />
      <MdCatalog :editor-id="id" :scroll-element="viewId" />
    </div>
  </me-dialog>
</template>

<script setup lang="ts" name="ViewMd">
// preview.css相比style.css少了编辑器那部分样式
import { useLocalesI18n } from '@/locales/i18n.js';
import 'meadmin-addons-doc/dist/preview.js';
const viewId = 'view-md_' + useId();
const id = 'mdp_' + useId();
const show = defineModel<boolean>();
const emit = defineEmits<{
  (e: 'closed'): void;
}>();
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`../lang/${locale}.json`), 'aonDoc']);
await Promise.all([loadRes]);
const text = ref('# Hello Editor');
</script>
<style lang="scss" scoped>
.view-md {
  overflow: auto;
}
</style>
