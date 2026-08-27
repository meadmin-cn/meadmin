<template>
  <JsonEditorVue :ref="changeRef" mode="text"></JsonEditorVue>
</template>

<script setup lang="ts" name="MeJsonEditor">
import JsonEditorVue from 'json-editor-vue';
const { expand = 'all' } = defineProps<{ expand?: number | 'all' }>(); //展开层级 从1开始
const vm = getCurrentInstance();
const editorRef = ref<InstanceType<typeof JsonEditorVue>>();
function changeRef(ref: Element | ComponentPublicInstance | null) {
  if (vm) {
    //暴露组件属性
    vm.exposed = ref;
    editorRef.value = ref as InstanceType<typeof JsonEditorVue>;
  }
}
onMounted(async () => {
  if (expand !== 'all') {
    setTimeout(() => {
      editorRef.value!.jsonEditor.collapse([], true);
      editorRef.value!.jsonEditor.expand([], (path) => path.length < expand);
    });
  }
});
//声明类型
defineExpose({} as InstanceType<typeof JsonEditorVue>);
</script>
