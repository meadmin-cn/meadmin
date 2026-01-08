<!-- table中展示文件item组件 -->
<template>
<div class="me-table-file-item">
<el-image v-for="item,index in fileList?.imageArr ??[]"
            class="view-img"
            :src="item"
            :zoom-rate="1.2"
            :max-scale="7"
            :min-scale="0.2"
            :preview-src-list="fileList.imageArr"
            :initial-index="index"
            show-progress
            preview-teleported
            fit="scale-down"
          />
  <el-link class="view-link" v-for="item,index in fileList?.fileArr ??[]" type="primary" :href="item.url" target="_blank">{{ item.name ??item.url }}</el-link>
</div>
</template>

<script setup lang="ts" name="MeTableFileItem">
import { isImage } from '@/utils/helper.js';
const props  = defineProps<{files:{url:string,name?:string}[]}>();
const fileList = computed(()=>{
  const imageArr = [] as string[];
  const fileArr = [] as {url:string,name?:string}[];
  props.files.forEach(item=>{
    if(isImage(item.url) || isImage(item.name)){
      imageArr.push(item.url);
    }else{
      fileArr.push(item);
    }
  })
  return {imageArr,fileArr};
});
console.log('---',fileList);
</script>
<style lang="scss" scoped>
.me-table-file-item{
  .view-img {
    width: 40px; 
    height: 40px;
  }
  .view-img:nth-child(n+2),.view-link:nth-child(n+2){
    margin-left: 5px;
  }
}
</style>