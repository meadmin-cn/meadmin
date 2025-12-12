<template>
  <div class="register">
    <div class="left">
      <div class="explanation">
        <div class="title">已有账户？</div>
        <div class="desc">请使用您的账户进行登录</div>
        <me-button class="button go" @click="setGo()">登录</me-button>
      </div>
    </div>
    <div class="right">
      <div class="form">
        <div class="title">注 册</div>
        <el-form ref="formRef" size="large">
          <el-form-item prop="username" class="upload-item">
            <el-upload action="#" class="upload-avater" list-type="picture-card" :auto-upload="false">
              <!-- <img v-if="imageUrl" :src="imageUrl" class="avatar" /> -->
              <mel-icon-upload-filled class="default-up-icon"></mel-icon-upload-filled>
              <div class="text">
                <mel-icon-upload-filled></mel-icon-upload-filled>
                <div class="text-desc">上传头像</div>
              </div>
            </el-upload>
          </el-form-item>
          <el-form-item prop="username">
            <el-input autofocus placeholder="昵称" clearable />
          </el-form-item>
          <el-form-item prop="username">
            <el-input autofocus placeholder="用户名" clearable />
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" placeholder="密码" clearable show-password />
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" placeholder="确认密码" clearable show-password />
          </el-form-item>
          <me-button class="button submit">注册</me-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="Register">
const emit = defineEmits<{
  go: [id: 'login' | 'register'];
}>();
const setGo = () => {
  emit('go', 'login');
};
</script>
<style lang="scss" scoped>
@use 'sass:math';

.register {
  background-image: linear-gradient(120deg,  #8e44ad,#3498db) !important;

  .right {
    background-color: #fff;
  }
  .upload-item{
    margin-bottom: 5px;
  }
  .upload-avater {
    margin: 0 auto;
    :deep(.el-upload-list) {
      background-image: conic-gradient(#3498db 0deg, #8e44ad 0deg, var(--el-border-color-darker) 0deg);
      width: 82px;
      height: 82px;
      border-radius: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      .el-upload {
        width: 80px;
        height: 80px;
        border-radius: 80px;
        border-style: solid;
        color: #a8abb2;
        position: relative;
        border-color: unset;
      }

      .text {
        position: absolute;
        background-color: rgba(0, 0, 0, 0.15);
        color: #fcfcfc;
        width: 100%;
        height: 100%;
        border-radius: 100%;
        justify-content: center;
        align-items: center;
        display: none;
        flex-direction: column;
        line-height: 100%;
        .text-desc{
          font-size: 0.8em;
        }
      }
       i {
        font-size: 1.5em;
      }
      @keyframes conicProcess {
      @for $i from 0 through 100 {
        #{$i * 1%} {
          background-image: conic-gradient(#3498db 0deg, #8e44ad #{math.div($i , 100) * 360 * 1deg}, var(--el-border-color-darker) #{math.div($i , 100) * 360 * 1deg});
        }
      }     
      }

    &:hover{
      animation: conicProcess 500ms ease-in;
      animation-fill-mode: forwards;
      .default-up-icon{
        display: none;
      }
      .text {
        display: flex;
      }
    }
    }   
  }
}
</style>
