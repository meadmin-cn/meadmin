<template>
  <div class="promise-error">
    <mel-icon-warning-filled class="warn-icon"></mel-icon-warning-filled>
    <div class="title">无权限访问</div>
    <div class="footer">
      <me-button class="button" @click="router.back">返回上一页</me-button>
      <me-button class="button active" type="primary" plain @click="userStore.logOut">{{ userStore.token ? '重新登陆' : '去 登 陆' }}</me-button>
    </div>
  </div>
</template>
<script setup lang="ts" name="PromiseError">
import { useUserStore } from '@/store';
const userStore = useUserStore();
const router = useRouter();
defineProps<{ msg: string }>();
</script>
<style lang="scss" scoped>
.promise-error {
  margin-top: 10vh !important;
  background-color: #fff;
  padding: 80px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
  border-radius: 10px;
  .warn-icon {
    font-size: 80px;
    color: rgb(250, 182, 182);
  }
  .title {
    margin-top: 15px;
    font-size: 32px;
    font-weight: bolder;
  }
  .footer {
    margin-top: 20px;
    .button {
      border-radius: 99px;
      width: 150px;
      height: 40px;
    }
    .button:nth-child(n + 2) {
      margin-left: 50px;
    }
  }
}
</style>
