<template>
  <el-upload
    v-model:file-list="fileList"
    list-type="picture-card"
    accept="image/*"
    class="me-up-avater"
    :class="{ upload: process > 0 }"
    :limit="1"
    :http-request="handleHttpRequest"
    :before-upload="beforeAvatarUpload"
    @success="handleSuccess"
    @remove="handleRemove"
    @exceed="handleExceed"
    @preview="handlePictureCardPreview"
    @progress="setProcess"
  >
    <template v-if="!file">
      <mel-icon-upload-filled class="default-up-icon"></mel-icon-upload-filled>
      <div class="text">
        <mel-icon-upload-filled></mel-icon-upload-filled>
        <div class="text-desc">上传头像</div>
      </div>
    </template>
  </el-upload>
</template>

<script setup lang="ts" name="MeUpAvatar">
import { FileInfo } from '@/api/file';
import { fileUpload } from '@/utils/fileUpload';
import { UploadFile, UploadProgressEvent, UploadProps, UploadRequestOptions } from 'element-plus';
import { createImageViewer } from './service/meImageViewer';
const file = defineModel<(FileInfo & { uid?: number }) | null>(undefined);
const fileList = reactive([] as Array<FileInfo & { uid?: number }>);
watch(
  () => file.value,
  (file) => {
    fileList.splice(0);
    file && fileList.push(file);
  },
);
//预览图片
const handlePictureCardPreview = () => {
  file.value &&
    createImageViewer({
      urlList: [file.value.url],
      initialIndex: 0,
      showProgress: true,
    });
};
//上传请求
const handleHttpRequest = (options: UploadRequestOptions) => {
  return fileUpload(options);
};
const handleSuccess = (response: FileInfo & { uid?: number }, uploadFile: UploadFile) => {
  response.uid = uploadFile.uid;
  file.value = response;
};
const handleRemove = () => {
  file.value = undefined;
  process.value = 0;
};
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (!/image*/.test(rawFile.type)) {
    ElMessage.error('必须是正确的图片文件');
    return false;
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};
//超出时
const handleExceed = () => {
  ElMessage({ type: 'error', message: `最多上传1个文件` });
};
const process = ref(0);
const processDeg = computed(() => {
  return (process.value / 100) * 360 + 'deg';
});
const setProcess = (env: UploadProgressEvent) => {
  process.value = env.percent;
};
</script>
<style lang="scss" scoped>
@use 'sass:math';

.me-up-avater {
  margin: 0 auto;

  :deep(.el-upload-list) {
    background-image: conic-gradient(#3498db 0deg, #8e44ad v-bind(processDeg), var(--el-border-color-darker) v-bind(processDeg));
    width: 82px;
    height: 82px;
    border-radius: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .el-upload,
    .el-upload-list__item {
      width: 80px;
      height: 80px;
      border-radius: 80px;
      border-style: solid;
      color: #a8abb2;
      position: absolute;
      border-color: unset;
      left: 1px;
      top: 1px;
    }

    .el-upload-list__item {
      z-index: 2;
    }

    .text {
      position: absolute;
      background-color: rgba(0, 0, 0, 0.15);
      color: #fcfcfc;
      width: 100%;
      height: 100%;
      border-radius: 100%;
      justify-content: center;
      align-items: center;
      display: none;
      flex-direction: column;
      line-height: 100%;

      .text-desc {
        font-size: 0.8em;
      }
    }

    .el-icon--close-tip {
      display: none !important;
    }

    i {
      font-size: 20px;
    }
  }

  @keyframes conicProcess {
    @for $i from 0 through 100 {
      #{$i * 1%} {
        background-image: conic-gradient(#3498db 0deg, #8e44ad #{math.div($i, 100) * 360 * 1deg}, var(--el-border-color-darker) #{math.div($i, 100) * 360 * 1deg});
      }
    }
  }

  &:not(.upload) {
    :deep(.el-upload-list:hover) {
      animation: conicProcess 500ms ease-in;
      animation-fill-mode: forwards;

      .default-up-icon {
        display: none;
      }

      .text {
        display: flex;
      }
    }
  }
}
</style>
