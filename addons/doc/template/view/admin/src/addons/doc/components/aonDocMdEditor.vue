<template>
  <MdEditor v-bind="attrs" :ref="changeRef" v-model="model" class="aon-doc-md-editor" @on-upload-img="onUploadImg" />
</template>

<script setup lang="ts" name="AonDocMdEditor">
//markdown编辑器
import { fileUpload } from '@/utils/fileUpload.js';
import { MdEditor } from 'meadmin-addons-doc';
import 'meadmin-addons-doc/dist/style.js';
const attrs = useAttrs();
const model = defineModel<string>();
const vm = getCurrentInstance();
function changeRef(ref: Element | ComponentPublicInstance | null) {
  if (vm) {
    //暴露elButton属性
    vm.exposed = ref;
  }
}
const onUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
  const urls = await Promise.all(
    files.map((file) => {
      return new Promise<string>(async (rev, rej) => {
        try {
          const res = await fileUpload({
            action: '',
            method: 'post',
            data: {},
            filename: file.name,
            file: Object.assign(file, { uid: 1 }),
            headers: {},
            withCredentials: false,
            onError: () => {},
            onProgress: () => {},
            onSuccess: () => {},
          });
          rev(res.url!);
        } catch (error) {
          rej(error);
        }
      });
    }),
  );

  callback(urls);
};
//声明类型
defineExpose({} as typeof MdEditor);
</script>
<style lang="scss" scoped>
.aon-doc-md-editor {
  line-height: normal;
}
</style>
