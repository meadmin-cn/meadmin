<template>
  <div class="no-page">
    <img src="@/assets/images/404.svg?url" />
    <div class="info">
      <div class="title">404</div>
      <div class="content">
        页面不见了!
        <router-link to="/">去首页</router-link>
      </div>
    </div>
  </div>
</template>
<script setup name="404"></script>
<style lang="scss" scoped>
.no-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 1.2rem;
  img {
    width: 100%;
    max-width: 500px;
  }

  .info {
    display: flex;
    flex-direction: column;
    align-items: center;

    .title {
      font-size: 1.5em;
    }

    .content {
      margin: 1.5em 0;
      color: var(--el-text-color-placeholder);
      display: flex;
      align-items: center;

      a {
        margin-left: 1em;
        color: var(--el-color-primary);
      }
    }
  }
}
</style>
