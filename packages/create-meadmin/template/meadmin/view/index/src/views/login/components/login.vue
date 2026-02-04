<template>
  <div class="login">
    <div class="left">
      <div class="form">
        <div class="title">登 录</div>
        <el-form ref="formRef" size="large" :rules="rules" :model="loginParams" @keyup.enter="submit">
          <el-form-item prop="username">
            <el-input v-model="loginParams.username" autofocus placeholder="用户名" clearable />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginParams.password" type="password" placeholder="密码" clearable show-password />
          </el-form-item>
          <el-form-item prop="captcha">
            <el-input v-model="loginParams.captcha" class="captcha-input" placeholder="验证码" clearable>
              <template #append>
                <img class="captcha-img" :src="captchaObj?.imageBase64" @click="getCaptch()" />
              </template>
            </el-input>
          </el-form-item>
          <me-button class="button submit" @click="submit()">登录</me-button>
        </el-form>
      </div>
    </div>
    <div class="right">
      <div class="explanation">
        <div class="title">没有账户？</div>
        <div class="desc">立即加入我们吧，点击下方按钮进行注册</div>
        <me-button class="button go" @click="setGo()">注册</me-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="Login">
import { LoginParams, loginCaptchaApi } from '@/api/login';
import { useUserStore } from '@/store';
import { FormInstance } from 'element-plus';
const loginParams = reactive(new LoginParams());
//验证码
const { data: captchaObj, runAsync: getCaptchRun } = loginCaptchaApi();
const getCaptch = async () => {
  await getCaptchRun();
  loginParams.captchaId = captchaObj.value!.id;
};
await getCaptch();
const rules = {
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
  captcha: [
    {
      required: true,
      message: '请填写验证码',
      trigger: 'blur',
    },
  ],
};
const userStore = useUserStore();
const formRef = ref<FormInstance>();
const route = useRoute();
const router = useRouter();
const _this = getCurrentInstance();
const submit = async () => {
  formRef.value?.validate(async (valid, fields) => {
    if (valid) {
      try {
        await userStore.login(_this!.appContext.app, loginParams);
        await router.replace((route.query.redirect as string) || '/');
      } catch {
        getCaptch();
      }
    } else {
      console.log('提交错误', fields);
      getCaptch();
    }
  });
};
const emit = defineEmits<{
  go: [id: 'login' | 'register'];
}>();
const setGo = () => {
  emit('go', 'register');
};
</script>
<style lang="scss" scoped>
.login {
  .left {
    background-color: #fff;
  }
  :deep(.el-form-item__error) {
    padding-left: 20px;
  }
}
</style>
