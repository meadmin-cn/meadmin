<template>
<div class="index">
<div>
  <el-carousel :interval="4000" height="auto">
    <el-carousel-item v-for="item in bgCrad" :key="item.title" style="height: max-content;">
      <div class="banner">
        <div class="content">
          <div class="title">{{ item.title }}</div>
          <div class="text">{{ item.content }}</div>
        </div>
        <img :src="item.bgImg"></img>
      </div>
    </el-carousel-item>
  </el-carousel>
</div>
</div>
</template>

<script setup lang="ts" name="Index">
import bannerCode from '@/assets/images/layout/bannerCode.jpg';
import bannerManage from '@/assets/images/layout/bannerManage.jpg';
import bannerGift from '@/assets/images/layout/bannerGift.jpg';
const bgCrad  = [{
  title:'高效的开发体验',
  content:'提供一键生成CRUD与菜单的自动化能力，大幅简化开发流程，显著提升项目构建效率。',
  bgImg:bannerCode,
},
{
  title:'开箱即用的服务端渲染',
  content:'前台页面默认集成服务端渲染（SSR），有效提升首屏加载速度，并优化SEO效果，助力内容更好收录。',
  bgImg:bannerGift,
},
{
  title:'强大的权限管理',
  content:'搭载完善的Auth权限控制，支持无限父子级分组与自由授权，管理员可跨组别，权限配置既灵活又严密。',
  bgImg:bannerManage,
},
];
</script>
<style lang="scss" scoped>
.index{
.banner{
  position: relative;
  width: 100%;
  img{
    display: block;
    width: 100%;
  }
  .content{
    position: absolute;
    top:15%;
    left:10%;
    color: #f5f3f3;
    background-color: rgba(0,0,0,0.3);
    padding: 50px 15px;
    max-width: 50%;
    width: 500px;
    border-radius: 5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    height: 70%;
    .title{
      margin-bottom: 20px;
      font-size: 30px;
      font-weight: bolder;
    }
    .content{
      font-size: 14px;
      line-height: 1.2em;
    }
  }
}
}
</style>