<template>
<div class="footer">
  © 2025 - {{ year }}. All Rights Reserved. Power by &nbsp;<a href="http://www.meadmin.cn"> MeAdmin </a>
</div>
</template>

<script setup lang="ts" name="Footer">
import dayjs from 'dayjs';
const year = dayjs().year()
</script>
<style lang="scss" scoped>
.footer{
  height: 60px;
  display: flex;
  align-items: center;
  a:hover, a:focus {
    text-decoration: underline;
  }
  a:hover{
    color:#fff;
  }
}
</style>