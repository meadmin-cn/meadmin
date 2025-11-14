<template>
  <el-upload class="me-upload" :file-list="fileList" v-bind="omit(attrs, 'fileList', 'httpRequest', 'onPreview', 'onSuccess')"
    :ref="changeRef" :http-request="handleHttpRequest" @preview="handlePictureCardPreview" @success="handleSuccess">
    <template v-for="(_, name) in $slots" #[name]="data">
      <slot :name="name" v-bind="data || {}"></slot>
    </template>
    <template v-if="!$slots.default && !$slots.trigger">
      <el-icon v-if="attrs.listType === 'picture-card'"><mel-icon-plus /></el-icon>
      <el-button v-else type="primary">{{ $t('上传') }}</el-button>
    </template>
    <el-button v-if="showSelect" @click.stop="openSelectFile()">{{ $t('选择') }}</el-button>
  </el-upload>
</template>
<script lang="ts" name="MeUpload" setup>
import { FileInfo } from '@/api/file';
import { UploadInstance, UploadFile, UploadFiles, UploadRequestHandler, UploadRequestOptions } from 'element-plus';
import { createImageViewer } from './service/meImageViewer';
import { omit } from 'lodash-es';
import { fileUpload } from '@/utils/fileUpload';
import { isImage } from '@/utils/helper';
import {useMeSelectFile} from '@/components/meSelectFile/meSelectFile.js';
const attrs = useAttrs();
defineOptions({inheritAttrs:false});
defineProps<{
  showSelect?:boolean;
}>()
const fileList = defineModel<(Pick<FileInfo,'name'|'url'>&{uid?:number})[]>({ default: () => [] });
//预览图片
const handlePictureCardPreview = (uploadFile: UploadFile) => {
  const url = (uploadFile.url ?? fileList.value.find(item=>(item.uid && item.uid === uploadFile.uid))?.url) || '';
  if(!isImage(url)){
    return window.open(url,'_blank');
  }
  const urlList = fileList.value.map(item => item.url).filter(v=>isImage(v));
  let index = urlList.findIndex(item=>item === url);
  if (index === -1) {
    urlList.unshift(url);
    index = 0;
  }
  createImageViewer({
    urlList: urlList,
    initialIndex: index,
    showProgress:true,
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
const {open} = useMeSelectFile();
const openSelectFile=()=>{
  open({
    onSelected(file){
      fileList.value.push(file);
    }
  })
}
//声明类型
defineExpose({} as UploadInstance);
</script>
<style lang="scss" scoped>
.me-upload{
  width: 100%;
}
</style>