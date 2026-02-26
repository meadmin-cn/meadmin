<template>
  <MdEditor
    v-bind="attrs"
    :ref="changeRef"
    v-model="model"
    class="aon-doc-md-editor"
  />
</template>

<script setup lang="ts" name="AonDocMdEditor">
//markdown编辑器
import { MdEditor } from "meadmin-addons-doc";
import "meadmin-addons-doc/dist/style.js";
const attrs = useAttrs();
const model = defineModel<string>();
const vm = getCurrentInstance();
function changeRef(ref: Element | ComponentPublicInstance | null) {
  if (vm) {
    //暴露elButton属性
    vm.exposed = ref;
  }
}
//声明类型
defineExpose({} as typeof MdEditor);
</script>
<style lang="scss" scoped>
.aon-doc-md-editor {
  line-height: normal;
}
</style>
