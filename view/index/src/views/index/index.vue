<template>
<div class="index">
<div class="header-banner">
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
<div class="body">
  <div class="item">
     <div class="title">我们的优势</div>
  <div class="desc">Me-Admin是你不错的选择</div>
  <div class="content">
    <div class="card">
      <div class="card-title">最新技术栈</div>
      <div class="card-content">基于Vue3、Vite、TypeScript、Pinia、Vue-request、Element-plus等最新技术栈开发</div>
    </div>
    <div class="card">
      <div class="card-title">国际化</div>
      <div class="card-content">独创的组件国际化语言包，开发便捷、按需加载</div>
    </div>
    <div class="card">
      <div class="card-title">按需引入</div>
      <div class="card-content">便捷的组件自动按需引入，真正的按需引入，type自动生成，极大方便开发</div>
    </div>
  </div>
  </div>
  <div class="item">
    <div class="title">功能特性</div>
  <div class="desc">Me-Admin是你不错的选择</div>
  <div class="content">
    <div class="card">
      <div class="card-title">最新技术栈</div>
      <div class="card-content">基于Vue3、Vite4、TypeScript、Pinia、Vue-request、Element-plus等最新技术栈开发</div>
    </div>
    <div class="card">
      <div class="card-title">国际化</div>
      <div class="card-content">独创的组件国际化语言包，开发便捷、按需加载</div>
    </div>
    <div class="card">
      <div class="card-title">按需引入</div>
      <div class="card-content">便捷的组件自动按需引入，真正的按需引入，type自动生成，极大方便开发</div>
    </div>
  </div>
  </div>
 
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
  min-height: 320px;
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
.body{ 
.item{
  display: flex;
  flex-direction: column;
  padding-top: 30px;
  align-items: center;
  .title{
    font-size: 32px;
    font-weight: bolder;
  }
  .desc{
    padding-top: 5px;
    font-size: 16px;
    color: #4e6e8e;
  }
  .content{
    display: grid;
    grid-template-columns: repeat(auto-fit, 30%);
    width: 100%;
    justify-content: space-between;
    padding: 25px;
    .card{
      background-color: #fff;
      border-radius: 2px;
      box-shadow: 0px 0px 2px 0px rgba(0,0,0,0.2) ;
      height: 200px;
      transition: all 0.3s;
      padding: 0 10px;
      .card-title{
        font-size: 22px;
        font-weight: bolde;
        line-height: 80px;
        border-bottom: 1px solid #f6eeee;
        text-align: center;
      }
      .card-content{
        padding-top: 20px;
        padding-left: 15px;
        padding-right: 15px;
        color: #4e6e8e;
        font-size: 16px;
        text-align: center;
      }
    }
    .card:hover{
      margin-top: -5px;
      box-shadow: 5px 5px 5px 2px rgba(0,0,0,0.3);
    }
}
}
.item:nth-child(n + 2){
  margin-top: 20px;
}
}
}
</style>