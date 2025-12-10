<template>
<div class="user">
<el-dropdown>
  <span class="el-dropdown-link">
    会员中心<el-icon-arrow-down class="icon"></el-icon-arrow-down>
  </span>
  <template #dropdown>
  <el-dropdown-menu slot="dropdown">
    <el-dropdown-item>登录</el-dropdown-item>
    <el-dropdown-item>注册</el-dropdown-item>
  </el-dropdown-menu>
  </template>
</el-dropdown>

</div>
</template>

<script setup lang="ts" name="User">

</script>
<style lang="scss" scoped>
.user{
  height: 100%;
  display: flex;
  align-items: center;
  .icon{
    height: 1.2em;
    margin-left: 5px;
  }
}
</style>