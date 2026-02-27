<template>
  <div :id="viewId" class="view-md">
    <MdPreview :id="id" :model-value="text" />
    <MdCatalog :editor-id="id" :scroll-element="viewId" />
  </div>
</template>

<script setup lang="ts" name="ViewMd">
// preview.css相比style.css少了编辑器那部分样式
import "meadmin-addons-doc/dist/preview.js";
const viewId = "view-md_" + useId();
const id = "mdp_" + useId();
const text = ref("# Hello Editor");
</script>
<style lang="scss" scoped>
.view-md {
}
</style>
