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
        <el-form ref="formRef" size="large" :rules="rules" :model="registerParams" @keyup.enter="submit">
          <el-form-item prop="username" class="upload-item">
            <me-up-avatar v-model="registerParams.avatar"></me-up-avatar>
          </el-form-item>
          <el-form-item prop="nickname">
            <el-input v-model="registerParams.nickname" autofocus placeholder="昵称" clearable />
          </el-form-item>
          <el-form-item prop="username">
            <el-input v-model="registerParams.username" placeholder="用户名" clearable />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="registerParams.password" type="password" placeholder="密码" clearable show-password />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="registerParams.reqPassword" type="password" placeholder="确认密码" clearable show-password />
          </el-form-item>
          <me-button class="button submit" @click="submit">注册</me-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="Register">
import { RegisterParams, registerApi } from '@/api/login';
import { FormInstance } from 'element-plus';
let registerParams = reactive(new RegisterParams());
const rules = {
  nickanem: [
    {
      required: true,
      message: '请填写昵称',
      trigger: 'blur',
    },
    {
      min: 3,
      max: 8,
      message: '长度必须在 3 到 8个字符之间',
      trigger: 'blur',
    },
  ],
  username: [
    {
      required: true,
      message: '请填写用户名',
      trigger: 'blur',
    },
    {
      min: 3,
      max: 8,
      message: '长度必须在 3 到 8个字符之间',
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      message: '请填写密码',
      trigger: 'blur',
    },
    {
      min: 6,
      max: 20,
      message: '长度必须在 6 到 20个字符之间',
      trigger: 'blur',
    },
  ],
  reqPassword: [
    {
      required: true,
      message: '确认密码',
      trigger: 'blur',
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error('请输入确认密码'));
        } else if (value !== registerParams.password) {
          callback(new Error('两次密码不一致'));
        } else {
          callback();
        }
      },
    },
  ],
};
const formRef = ref<FormInstance>();
const { runAsync } = registerApi({});
const submit = async () => {
  formRef.value?.validate(async (valid, fields) => {
    if (valid) {
      await runAsync(registerParams);
      emit('go', 'login');
    } else {
      console.log('提交错误', fields);
    }
  });
};
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
  background-image: linear-gradient(120deg, #8e44ad, #3498db) !important;

  .right {
    background-color: #fff;
  }
  .upload-item {
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
        .text-desc {
          font-size: 0.8em;
        }
      }
      i {
        font-size: 1.5em;
      }
      @keyframes conicProcess {
        @for $i from 0 through 100 {
          #{$i * 1%} {
            background-image: conic-gradient(#3498db 0deg, #8e44ad #{math.div($i, 100) * 360 * 1deg}, var(--el-border-color-darker) #{math.div($i, 100) * 360 * 1deg});
          }
        }
      }

      &:hover {
        animation: conicProcess 500ms ease-in;
        animation-fill-mode: forwards;
        .default-up-icon {
          display: none;
        }
        .text {
          display: flex;
        }
      }
    }
  }
  :deep(.el-form-item__error) {
    padding-left: 20px;
  }
}
</style>
