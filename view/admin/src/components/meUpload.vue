<template>
  <el-upload
    class="me-upload"
    :file-list="fileList"
    v-bind="omit(attrs, 'fileList', 'httpRequest', 'onPreview', 'onSuccess','onRemove')"
    :ref="changeRef"
    :http-request="handleHttpRequest"
    @preview="handlePictureCardPreview"
    @success="handleSuccess"
    @remove="handleRemove"
    @exceed="handleExceed"
  >
    <template v-for="(_, name) in $slots" #[name]="data">
      <slot :name="name" v-bind="data || {}"></slot>
    </template>
    <template v-if="!$slots.default && !$slots.trigger">
      <el-icon v-if="(attrs['list-type'] || attrs.listType) === 'picture-card'"><mel-icon-plus /></el-icon>
      <el-button v-else type="primary">{{ $t('上传') }}</el-button>
    </template>
    <el-button v-if="showSelect" @click.stop="openSelectFile()">{{ $t('选择') }}</el-button>
  </el-upload>
</template>
<script lang="ts" name="MeUpload" setup>
import { FileInfo } from '@/api/file';
import { UploadInstance, UploadFile, UploadFiles, UploadRequestHandler, UploadRequestOptions, UploadUserFile } from 'element-plus';
import { createImageViewer } from './service/meImageViewer';
import { omit } from 'lodash-es';
import { fileUpload } from '@/utils/fileUpload';
import { isImage } from '@/utils/helper';
import { useMeSelectFile } from '@/components/meSelectFile/meSelectFile.js';
import { useLocalesI18n } from '@/locales/hooks';
import { snakeToCamelCaseObj } from '@/utils/formatting.js';
let { t } = useLocalesI18n();
const attrs = snakeToCamelCaseObj(useAttrs());
defineOptions({ inheritAttrs: false });
const { showSelect = true } = defineProps<{
  showSelect?: boolean;
}>();
const fileList = defineModel<(FileInfo & { uid?: number })[]>({ default: () => [] });
//预览图片
const handlePictureCardPreview = (uploadFile: UploadFile) => {
  const url = (uploadFile.url ?? fileList.value.find((item) => item.uid && item.uid === uploadFile.uid)?.url) || '';
  if (!isImage(url)) {
    return window.open(url, '_blank');
  }
  const urlList = fileList.value.map((item) => item.url).filter((v) => isImage(v));
  let index = urlList.findIndex((item) => item === url);
  if (index === -1) {
    urlList.unshift(url);
    index = 0;
  }
  createImageViewer({
    urlList: urlList,
    initialIndex: index,
    showProgress: true,
  });
};
//上传请求
const handleHttpRequest = (options: UploadRequestOptions) => {
  return attrs.httpRequest ? (attrs.httpRequest as UploadRequestHandler)(options) : fileUpload(options);
};
const handleSuccess = (response: FileInfo  & { uid?: number }, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  response.uid = uploadFile.uid;
  fileList.value.push(response);
  fileList.value = [...fileList.value];
  if (attrs.onSuccess) {
    (attrs as any).onSuccess(response, uploadFile, uploadFiles);
  }
};
const handleRemove = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  fileList.value = [...uploadFiles as unknown as (FileInfo & { uid?: number })[]];
  if (attrs.onRemove) {
    (attrs as any).onRemove(uploadFile, uploadFiles);
  }
};
const vm = getCurrentInstance();
const upload = ref<UploadInstance | null>()
function changeRef(ref: Element | ComponentPublicInstance | null) {
  if (vm) {
    //暴露elUpload属性
    vm.exposed = ref;
    upload.value = ref as UploadInstance;
  }
}
//超出时
const handleExceed = (files: Array<File|FileInfo>, uploadFiles?: UploadUserFile[]) => {
  if (attrs.onExceed) {
    (attrs as any).onExceed(files, uploadFiles);
  }
  ElMessage({type:'error',message: t('最多上传{num}个文件',{num:attrs.limit})})
}
const { open } = useMeSelectFile();
const openSelectFile = () => {
  open({
    onSelected(file) {
      if(attrs.limit && fileList.value.length >= (attrs.limit as number)){
       return handleExceed([file]);
      }
      fileList.value.push(file);
      fileList.value = [...fileList.value];
      if (attrs.onSuccess) {
        (attrs as any).onSuccess(file);
      }
    },
  });
};
//声明类型
defineExpose({} as UploadInstance);

</script>
<style lang="scss" scoped>
.me-upload {
  width: 100%;
}
</style>
