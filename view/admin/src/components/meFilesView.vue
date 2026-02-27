<!-- table中展示文件item组件 -->
<template>
  <div class="me-files-view">
    <el-image v-for="(item, index) in fileList?.imageArr ?? []" :key="index" class="view-img" :src="item" :zoom-rate="1.2" :max-scale="7" :min-scale="0.2" :preview-src-list="fileList.imageArr" :initial-index="index" :title="$t('点击预览')" show-progress preview-teleported fit="scale-down" />
    <el-link v-for="(item, index) in fileList?.fileArr ?? []" :key="index" class="view-link" type="primary" :href="item.url" target="_blank" :title="$t('点击下载')">{{ item.name ?? item.url }}</el-link>
  </div>
</template>

<script setup lang="ts" name="MeTableFileItem">
import { isImage } from '@/utils/helper.js';
const props = defineProps<{ files: { url: string; name?: string }[] }>();
const fileList = computed(() => {
  const imageArr = [] as string[];
  const fileArr = [] as { url: string; name?: string }[];
  props.files.forEach((item) => {
    if (isImage(item.url) || isImage(item.name)) {
      imageArr.push(item.url);
    } else {
      fileArr.push(item);
    }
  });
  return { imageArr, fileArr };
});
</script>
<style lang="scss" scoped>
.me-files-view {
  .view-img {
    width: 40px;
    height: 40px;
  }
  .view-img:nth-child(n + 2),
  .view-link:nth-child(n + 2) {
    margin-left: 5px;
  }
}
</style>
