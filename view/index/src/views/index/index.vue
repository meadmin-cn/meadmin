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
      <div v-for="item in info.info" :key="item.title" class="item">
        <div class="title">{{ item.title }}</div>
        <div class="desc">{{ item.desc }}</div>
        <div class="content">
          <div v-for="value in item.list" :key="value.title" class="card">
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
  font-family: 'Plus Jakarta Sans', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif;

  /* ---------- Banner ---------- */
  .header-banner {
    margin-top: 16px;
    overflow: hidden;
    border-radius: 16px;
    box-shadow: 0 16px 40px -16px rgba(24, 36, 88, 0.25);
  }
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
      top: 50%;
      left: 6%;
      transform: translateY(-50%);
      max-width: 460px;
      padding: 32px 36px;
      color: #fff;
      background: rgba(16, 20, 34, 0.45);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 16px;
      box-shadow: 0 12px 32px -12px rgba(0, 0, 0, 0.35);

      .title {
        margin-bottom: 14px;
        font-size: 34px;
        font-weight: 800;
        line-height: 1.25;
        letter-spacing: -0.01em;
      }

      .text {
        font-size: 15px;
        line-height: 1.8;
        color: rgba(255, 255, 255, 0.88);
      }
    }
  }

  /* 轮播指示器/箭头：胶囊指示条 + 毛玻璃箭头 */
  .header-banner :deep(.el-carousel__button) {
    width: 18px;
    height: 4px;
    border-radius: 999px;
    opacity: 0.5;
    transition: all 0.25s;
  }
  .header-banner :deep(.el-carousel__indicator.is-active .el-carousel__button) {
    width: 28px;
    opacity: 1;
  }
  .header-banner :deep(.el-carousel__arrow) {
    background: rgba(16, 20, 34, 0.35);
    backdrop-filter: blur(6px);
    &:hover {
      background: rgba(16, 20, 34, 0.55);
    }
  }

  /* ---------- 内容区块 ---------- */
  .body {
    .item {
      display: flex;
      flex-direction: column;
      padding: 56px 0 8px;
      align-items: center;

      .title {
        position: relative;
        padding-bottom: 14px;
        font-size: 30px;
        font-weight: 800;
        letter-spacing: -0.01em;
        color: #181c28;
        /* 标题下装饰条 */
        &::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          width: 44px;
          height: 4px;
          border-radius: 999px;
          background: #2b5cff;
        }
      }

      .desc {
        padding-top: 14px;
        font-size: 15.5px;
        color: #6b7280;
      }

      .content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 24px;
        width: 100%;
        padding: 36px 8px 24px;

        .card {
          background-color: #fff;
          border: 1px solid #e8ebf2;
          border-radius: 14px;
          box-shadow: 0 4px 16px -8px rgba(24, 36, 88, 0.08);
          min-height: 180px;
          padding: 28px 24px;
          box-sizing: border-box;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;

          .card-title {
            font-size: 19px;
            font-weight: 700;
            color: #181c28;
            text-align: center;
            padding-bottom: 14px;
            margin-bottom: 14px;
            border-bottom: 1px solid #f0f2f7;
          }

          .card-content {
            color: #6b7280;
            font-size: 14.5px;
            line-height: 1.8;
            text-align: center;
          }
        }

        .card:hover {
          transform: translateY(-6px);
          border-color: rgba(43, 92, 255, 0.35);
          box-shadow: 0 18px 36px -14px rgba(43, 92, 255, 0.25);
        }
      }
    }

    .item:nth-child(n + 2) {
      margin-top: 20px;
    }
  }

  /* ---------- 移动端 ---------- */
  @media (max-width: 720px) {
    .header-banner {
      margin-top: 10px;
      border-radius: 12px;
    }
    .banner {
      min-height: 220px;
      .content {
        left: 5%;
        right: 5%;
        max-width: none;
        padding: 20px 22px;
        border-radius: 12px;
        .title {
          margin-bottom: 8px;
          font-size: 22px;
        }
        .text {
          font-size: 13.5px;
          line-height: 1.6;
        }
      }
    }
    .body .item {
      padding: 40px 0 4px;
      .title {
        font-size: 24px;
      }
      .desc {
        font-size: 14px;
        text-align: center;
      }
      .content {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 24px 0 8px;
        .card {
          min-height: 0;
          padding: 22px 20px;
        }
      }
    }
  }
}
</style>
