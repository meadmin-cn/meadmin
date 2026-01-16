<template>
  <div class="index">
    <div class="header-banner">
      <el-carousel :interval="4000" height="auto">
        <el-carousel-item v-for="item in info.banner" :key="item.title" style="height: max-content">
          <div class="banner">
            <div class="content">
              <div class="title">{{ item.title }}</div>
              <div class="text">{{ item.content }}</div>
            </div>
            <img :src="item.bgImg" />
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
    <div class="body">
      <div class="item" v-for="item in info.info">
        <div class="title">{{ item.title }}</div>
        <div class="desc">{{ item.desc }}</div>
        <div class="content">
          <div class="card" v-for="value in item.list">
            <div class="card-title">{{ value.title }}</div>
            <div class="card-content">{{ value.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="Index">
import { indexApi } from '@/api';
//接口必须在顶级异步调用，才会在服务端调用。
const info = await indexApi().runAsync();
</script>
<style lang="scss" scoped>
.index {
  .banner {
    position: relative;
    width: 100%;
    min-height: 320px;

    img {
      display: block;
      width: 100%;
    }

    .content {
      position: absolute;
      top: 15%;
      left: 10%;
      color: #f5f3f3;
      background-color: rgba(0, 0, 0, 0.3);
      padding: 50px 15px;
      max-width: 50%;
      width: 500px;
      border-radius: 5px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      height: 70%;

      .title {
        margin-bottom: 20px;
        font-size: 30px;
        font-weight: bolder;
      }

      .content {
        font-size: 14px;
        line-height: 1.2em;
      }
    }
  }

  .body {
    .item {
      display: flex;
      flex-direction: column;
      padding-top: 30px;
      align-items: center;

      .title {
        font-size: 32px;
        font-weight: bolder;
      }

      .desc {
        padding-top: 5px;
        font-size: 16px;
        color: #4e6e8e;
      }

      .content {
        display: grid;
        grid-template-columns: repeat(auto-fit, 30%);
        width: 100%;
        justify-content: space-between;
        padding: 25px;

        .card {
          background-color: #fff;
          border-radius: 2px;
          box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.2);
          height: 200px;
          transition: all 0.3s;
          padding: 0 10px;

          .card-title {
            font-size: 22px;
            font-weight: bolde;
            line-height: 80px;
            border-bottom: 1px solid #f6eeee;
            text-align: center;
          }

          .card-content {
            padding-top: 20px;
            padding-left: 15px;
            padding-right: 15px;
            color: #4e6e8e;
            font-size: 16px;
            text-align: center;
          }
        }

        .card:hover {
          margin-top: -5px;
          box-shadow: 5px 5px 5px 2px rgba(0, 0, 0, 0.3);
        }
      }
    }

    .item:nth-child(n + 2) {
      margin-top: 20px;
    }
  }
}
</style>
