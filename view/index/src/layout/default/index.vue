<template>
<div class="layout">
<div class="layout-header">
  <Header></Header>
</div>
<div class="layout-page">
  <Page></Page>
</div>
<div class="layout-footer">
  <Footer></Footer>
</div>
</div>
</template>

<script setup lang="ts" name="Index">
import Header from './header/index.vue';
import Page from './page.vue';
import Footer from './footer.vue';
</script>
<style lang="scss" scoped>
@use "./layout.scss" as *;
.layout{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
  .layout-header{
    background-color: #fff;
    width: 100%;
    border-bottom: 1px solid #dcdfe6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    >div{
      width: $content-width;
      margin: 0 auto;

    }
  }
  .layout-page{
    flex: 1;
    >div{
      width: $content-width;
      margin: 0 auto;

    }
  }
  .layout-footer{
    position: sticky;
    bottom: 0;
    background-color: #1a2027;
    color: #ede5e5;
    >div{
      width: $content-width;
      margin: 0 auto;

    }
  }
}
</style>