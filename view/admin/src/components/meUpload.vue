<template>
  <el-upload :file-list="fileList" v-bind="omit(attrs, 'fileList', 'httpRequest', 'onPreview', 'onSuccess')"
    :ref="changeRef" :http-request="handleHttpRequest" @preview="handlePictureCardPreview" @success="handleSuccess">
    <template v-if="!$slots.default">
      <el-icon v-if="attrs.listType === 'picture-card'"><mel-icon-plus /></el-icon>
      <el-button v-else type="primary">{{ $t('上传') }}</el-button>
    </template>
    <template v-for="(_, name) in $slots" #[name]="data">
      <slot :name="name" v-bind="data || {}"></slot>
    </template>
  </el-upload>
</template>
<script lang="ts" name="MeUpload" setup>
import { FileInfo } from '@/api/file';
import { ElUpload, UploadFile, UploadFiles, UploadRequestHandler, UploadRequestOptions } from 'element-plus';
import { createImageViewer } from './service/meImageViewer';
import { omit } from 'lodash-es';
import { ComponentInstance } from 'vue';
import { fileUpload } from '@/utils/fileUpload';
import { resetObj } from '@/utils/helper';
const attrs = useAttrs();
const fileList = defineModel<(FileInfo&{uid?:number})[]>({ default: () => [] });
//预览图片
const handlePictureCardPreview = (uploadFile: UploadFile) => {
  const urlList = fileList.value.map(item => item.url);
  if (urlList.includes(uploadFile.url!)) {
    urlList.unshift(uploadFile.url!)
  }
  createImageViewer({
    urlList: urlList,
    initialIndex: urlList.findIndex(url => url === uploadFile.url)
  })
}
//上传请求
const handleHttpRequest = (options: UploadRequestOptions) => {
  return attrs.httpRequest ? (attrs.httpRequest as UploadRequestHandler)(options) : fileUpload(options);
}
const handleSuccess = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  response.uid = uploadFile.uid;
  fileList.value.push(response);
  if(attrs.onSuccess){
    (attrs as any).onSuccess(response, uploadFile, uploadFiles)
  }
}
const vm = getCurrentInstance();
function changeRef(ref: Element | ComponentPublicInstance | null) {
  if (vm) {
    //暴露elUpload属性
    vm.exposed = ref;
  }
}
//声明类型
defineExpose({} as ComponentInstance<typeof ElUpload>);
</script>
<style lang="scss" scoped></style>