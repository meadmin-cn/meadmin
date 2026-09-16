<template>
  <main class="login">
    <div class="brand">
      <me-icon-logo :size="34" style="fill: none" /><span>Me<span class="brand-dot"> - </span>Admin</span>
    </div>
    <login-header class="header" />
    <section class="brand-panel">
      <div class="brand-content">
        <div class="eyebrow"><span /> SIMPLE. POWERFUL. OPEN.</div>
        <h1>
          {{ t('让管理更简单') }}<span>{{ t('让开发更高效') }}</span>
        </h1>
        <p class="brand-description">meadmin · {{ t('全栈一站式解决方案') }}</p>
        <div class="dashboard-art" aria-hidden="true">
          <div class="art-orbit" />
          <div class="dashboard-glass">
            <div class="art-topbar"><i /><i /><i /><span>WORKSPACE OVERVIEW</span></div>
            <div class="art-body">
              <div class="art-sidebar"><b /><b /><b /><b /></div>
              <div class="art-main">
                <div class="art-heading" />
                <div class="art-caption" />
                <div class="art-bars"><i /><i /><i /><i /><i /><i /><i /></div>
                <div class="art-baseline" />
              </div>
            </div>
          </div>
          <div class="floating-label"><span class="status-dot" /> Everything in one place</div>
          <div class="floating-stat">
            <span>BUILD WITHOUT LIMITS</span><strong>{{ t('无限可能') }}<span>↗</span></strong>
            <div />
          </div>
        </div>
        <div class="feature-tags">
          <span>{{ t('开箱即用') }}</span
          ><i /><span>{{ t('灵活扩展') }}</span
          ><i /><span>{{ t('MIT 开源') }}</span>
        </div>
      </div>
    </section>
    <section class="form-panel">
      <div class="form">
        <div class="card-accent" />
        <div class="form-eyebrow">WELCOME BACK</div>
        <h2>{{ t('登录') }}</h2>
        <p class="form-description">{{ t('欢迎回来，开启高效之旅') }}</p>
        <el-form ref="formRef" :rules="rules" :model="loginParams" label-position="top" size="large" @submit.prevent="login">
          <el-form-item prop="username" :label="t('用户名')">
            <el-input v-model="loginParams.username" autocomplete="username" :placeholder="t('用户名')" clearable />
          </el-form-item>
          <el-form-item prop="password" :label="t('密码')">
            <el-input v-model="loginParams.password" autocomplete="current-password" type="password" :placeholder="t('密码')" clearable show-password />
          </el-form-item>
          <el-form-item prop="captcha" :label="t('验证码')">
            <div class="captcha-row">
              <el-input v-model="loginParams.captcha" autocomplete="off" :placeholder="t('验证码')" clearable />
              <button type="button" class="captcha-button" aria-label="刷新验证码" title="点击刷新验证码" @click="getCaptch()"><img v-if="captchaObj?.imageBase64" :src="captchaObj.imageBase64" alt="图形验证码" /></button>
            </div>
          </el-form-item>
          <div class="login-options">
            <el-checkbox v-model="rememberUsername">{{ t('记住用户名') }}</el-checkbox>
          </div>
          <el-button class="submit" type="primary" native-type="submit" :loading="submitting">{{ t('登录') }}<span class="button-arrow">→</span></el-button>
        </el-form>
      </div>
      <div class="page-footer">meadmin <span>·</span> {{ t('全栈一站式解决方案') }}</div>
    </section>
  </main>
</template>
<script setup lang="ts" name="Login">
import { LoginParams, loginCaptchaApi } from '@/api/login';
import { useLocalesI18n } from '@/locales/i18n';
import { useUserStore } from '@/store';
import type { FormInstance, FormRules } from 'element-plus';
import LoginHeader from './components/header.vue';
const userStore = useUserStore();
const formRef = ref<FormInstance>();
const route = useRoute();
const router = useRouter();
const loginParams = reactive(new LoginParams());
// 仅记住用户名，不保存密码或改变登录有效期。
const rememberedUsername = useLocalStorage('me-login-username', '');
const rememberUsername = ref(Boolean(rememberedUsername.value));
loginParams.username = rememberedUsername.value;
const submitting = ref(false);
//验证码
const { data: captchaObj, runAsync: getCaptchRun } = loginCaptchaApi();
const getCaptch = async () => {
  await getCaptchRun();
  loginParams.captchaId = captchaObj.value!.id;
};
getCaptch();
let { t } = useLocalesI18n();
const rules = computed<FormRules>(() => ({
  username: [
    {
      required: true,
      message: t('请填写') + ' ' + t('用户名'),
      trigger: 'blur',
    },
    {
      min: 3,
      max: 8,
      message: t('长度必须在 {0} 到 {1}个字符之间', [3, 8]),
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      message: t('请填写') + ' ' + t('密码'),
      trigger: 'blur',
    },
    {
      min: 6,
      max: 20,
      message: t('长度必须在 {0} 到 {1}个字符之间', [6, 20]),
      trigger: 'blur',
    },
  ],
  captcha: [
    {
      required: true,
      message: t('请填写') + ' ' + t('验证码'),
      trigger: 'blur',
    },
  ],
}));
const login = async () => {
  if (submitting.value || !formRef.value) return;
  if (!(await formRef.value.validate().catch(() => false))) return;
  submitting.value = true;
  try {
    await userStore.login(loginParams);
    rememberedUsername.value = rememberUsername.value ? loginParams.username : '';
    await router.replace((route.query.redirect as string) || '/');
  } catch {
    // 登录失败后刷新验证码，避免重复提交已失效的验证码。
    loginParams.captcha = '';
    await getCaptch();
  } finally {
    submitting.value = false;
  }
};
</script>
<style lang="scss" scoped>
.login {
  --login-ink: #243b59;
  position: relative;
  display: flex;
  min-height: 100%;
  min-height: 100dvh;
  background: #f5f8fd;
  color: var(--login-ink);
  isolation: isolate;
  box-sizing: border-box;
}
.brand {
  position: absolute;
  top: 32px;
  left: 42px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 22px;
  font-weight: 750;
  letter-spacing: -0.6px;
}
.brand-dot {
  color: #658ad3;
}
.header {
  position: absolute;
  right: 30px;
  top: 22px;
  z-index: 3;
  gap: 10px;
  border: 1px solid #ffffffa8;
  border-radius: 30px;
  background: #ffffff80;
  backdrop-filter: blur(16px);
}
.brand-panel {
  position: relative;
  width: 59%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 140px 8% 100px 5%;
  box-sizing: border-box;
}
.brand-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  clip-path: polygon(0 0, 91% 0, 100% 100%, 0 100%);
  background: radial-gradient(ellipse at 18% 24%, #bde5ff99, transparent 55%), radial-gradient(ellipse at 70% 82%, #cdd9ff99, transparent 50%), linear-gradient(135deg, #edf7ff, #dcecff);
}
.brand-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0.4;
  clip-path: polygon(0 0, 91% 0, 100% 100%, 0 100%);
  background-image: linear-gradient(#ffffff75 1px, transparent 1px), linear-gradient(90deg, #ffffff75 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(transparent, #000, transparent);
}
.brand-content {
  width: 100%;
  max-width: 560px;
}
.eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 2.8px;
  color: #6484aa;
}
.eyebrow > span {
  width: 26px;
  height: 2px;
  background: linear-gradient(90deg, #479eee, #8e8feb);
}
h1 {
  font-size: clamp(32px, 3.3vw, 58px);
  line-height: 1.35;
  letter-spacing: -1.8px;
  margin: 24px 0 18px;
  font-weight: 750;
}
h1 > span {
  display: block;
  color: #4e83d8;
}
.brand-description {
  font-size: 15px;
  color: #7188a5;
  letter-spacing: 1px;
}
.dashboard-art {
  position: relative;
  width: 92%;
  max-width: 480px;
  height: 260px;
  margin: 46px 0 32px;
}
.dashboard-glass {
  position: absolute;
  top: 18px;
  left: 12px;
  width: 86%;
  height: 212px;
  border-radius: 16px;
  border: 1px solid #ffffff;
  background: linear-gradient(125deg, #ffffffb8, #ffffff40);
  box-shadow:
    0 24px 55px #7298c42b,
    inset 0 1px 0 #fff;
  backdrop-filter: blur(15px);
  transform: perspective(1000px) rotateY(-8deg) rotateX(4deg);
}
.art-topbar {
  height: 36px;
  border-bottom: 1px solid #c2d6eb55;
  display: flex;
  align-items: center;
  padding: 0 15px;
  gap: 5px;
}
.art-topbar > i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #94b5e6;
}
.art-topbar > i:nth-child(2) {
  background: #aac7ec;
}
.art-topbar > i:nth-child(3) {
  background: #c3d6f1;
}
.art-topbar > span {
  margin-left: auto;
  color: #8da6c8;
  font-size: 7px;
  letter-spacing: 1.5px;
}
.art-body {
  display: flex;
  height: 175px;
}
.art-sidebar {
  width: 58px;
  padding: 23px 12px;
  border-right: 1px solid #c2d6eb55;
}
.art-sidebar > b {
  display: block;
  height: 4px;
  background: #c5d8ed;
  border-radius: 4px;
  margin-bottom: 13px;
}
.art-sidebar > b:first-child {
  background: #82b6f0;
}
.art-main {
  flex: 1;
  padding: 22px;
}
.art-heading {
  width: 43%;
  height: 6px;
  background: #aac5e9;
  border-radius: 4px;
}
.art-caption {
  width: 28%;
  height: 4px;
  background: #d1e0f1;
  margin-top: 8px;
  border-radius: 4px;
}
.art-bars {
  height: 86px;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding-top: 12px;
}
.art-bars > i {
  flex: 1;
  height: 32%;
  border-radius: 5px 5px 0 0;
  background: linear-gradient(#76c9f5, #6799e4);
  box-shadow: inset 0 1px 0 #ffffff75;
}
.art-bars > i:nth-child(2) {
  height: 52%;
}
.art-bars > i:nth-child(3) {
  height: 43%;
}
.art-bars > i:nth-child(4) {
  height: 72%;
  background: linear-gradient(#aaaef5, #8c98e6);
}
.art-bars > i:nth-child(5) {
  height: 61%;
}
.art-bars > i:nth-child(6) {
  height: 95%;
}
.art-bars > i:nth-child(7) {
  height: 78%;
}
.art-baseline {
  height: 1px;
  background: #b4cbea;
}
.art-orbit {
  position: absolute;
  inset: 14px -8px 4px -10px;
  border: 1px solid #abc9ed66;
  border-radius: 50%;
  transform: rotate(-18deg);
}
.floating-label {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #ffffffb0;
  border: 1px solid #fff;
  box-shadow: 0 10px 25px #7fa1cb18;
  font-size: 10px;
  color: #6e88aa;
  backdrop-filter: blur(14px);
}
.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #65bea9;
  box-shadow: 0 0 0 3px #65bea915;
}
.floating-stat {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 18px 20px;
  width: 170px;
  border-radius: 14px;
  background: #ffffffb8;
  border: 1px solid #fff;
  box-shadow: 0 15px 35px #7c9cc322;
  backdrop-filter: blur(16px);
}
.floating-stat > span {
  font-size: 7px;
  letter-spacing: 1px;
  color: #87a0bf;
}
.floating-stat > strong {
  display: flex;
  justify-content: space-between;
  white-space: nowrap;
  gap: 10px;
  font-size: 21px;
  margin: 10px 0;
}
.floating-stat strong > span {
  color: #6e9fe4;
}
.floating-stat > div {
  height: 3px;
  width: 80%;
  border-radius: 3px;
  background: linear-gradient(90deg, #65bbed, #a4a6eb);
}
.feature-tags {
  display: flex;
  gap: 18px;
  align-items: center;
  font-size: 12px;
  color: #748ca9;
}
.feature-tags i {
  width: 3px;
  height: 3px;
  background: #a1b8d3;
  border-radius: 50%;
}
.form-panel {
  position: relative;
  width: 41%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 110px 40px 85px 10px;
  box-sizing: border-box;
}
.form {
  position: relative;
  width: 100%;
  max-width: 408px;
  box-sizing: border-box;
  padding: 44px 38px 38px;
  border: 1px solid #fff;
  border-radius: 23px;
  background: #ffffffc9;
  box-shadow:
    0 25px 65px #3b5c8712,
    0 3px 12px #3b5c8705;
  backdrop-filter: blur(24px);
}
.card-accent {
  position: absolute;
  left: 38px;
  top: -1px;
  width: 62px;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, #509eee, #9995e7);
}
.form-eyebrow {
  font-size: 9px;
  letter-spacing: 2.5px;
  color: #7598c7;
  font-weight: 650;
}
h2 {
  font-size: 28px;
  letter-spacing: -0.7px;
  margin: 12px 0 10px;
}
.form-description {
  font-size: 12px;
  color: #98a6b9;
  margin: 0 0 30px;
}
.form :deep(.el-form-item) {
  margin-bottom: 22px;
}
.form :deep(.el-form-item__label) {
  font-size: 12px;
  color: var(--login-ink);
  line-height: 20px;
  margin-bottom: 7px;
}
.form :deep(.el-input__wrapper) {
  min-height: 44px;
  box-sizing: border-box;
  border-radius: 9px;
  background: #f6f9fd;
  box-shadow: 0 0 0 1px #e8edf5 inset;
}
.form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}
.form :deep(.el-input__inner) {
  font-size: 13px;
}
.captcha-row {
  width: 100%;
  display: flex;
  gap: 12px;
}
.captcha-row > .el-input {
  min-width: 0;
  flex: 1;
}
.captcha-button {
  flex-shrink: 0;
  width: 112px;
  padding: 0;
  border: 1px solid #e8edf5;
  border-radius: 9px;
  overflow: hidden;
  background: #f0f5fc;
  cursor: pointer;
}
.captcha-button img {
  display: block;
  width: 100%;
  height: 44px;
  object-fit: contain;
}
.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: -5px 0 18px;
  gap: 8px;
}
.login-options :deep(.el-checkbox__label) {
  font-size: 12px;
  color: #8191a9;
}
.workspace-label {
  display: flex;
  gap: 7px;
  align-items: center;
  color: #99a8bb;
  font-size: 10px;
}
.submit {
  width: 100%;
  height: 46px;
  border: 0;
  border-radius: 9px;
  background: linear-gradient(105deg, #4b97ee, #7885e4);
  box-shadow: 0 8px 18px #6490e333;
  font-weight: 600;
  letter-spacing: 3px;
}
.submit:hover {
  filter: brightness(1.05);
}
.button-arrow {
  position: absolute;
  right: 22px;
  font-size: 18px;
  font-weight: 400;
}
.submit {
  position: relative;
}
.page-footer {
  position: absolute;
  bottom: 28px;
  font-size: 10px;
  color: #9eacc0;
  letter-spacing: 1px;
}
.page-footer > span {
  margin: 0 8px;
}
:global(html.dark .login) {
  --login-ink: #e0e9f7;
  background: #182131;
}
:global(html.dark .login .brand-panel::before) {
  background: radial-gradient(ellipse at 30% 25%, #305477, transparent 70%), #202f48;
}
:global(html.dark .login .form) {
  background: #202d40dc;
  border-color: #ffffff18;
}
:global(html.dark .login .header) {
  background: #202d4080;
  border-color: #ffffff18;
}
:global(html.dark .login .el-input__wrapper) {
  background: #182437;
  box-shadow: 0 0 0 1px #ffffff12 inset;
}
:global(html.dark .login .floating-stat) {
  color: #243b59;
}
@media (min-width: 1700px) {
  .form {
    max-width: 440px;
    padding: 50px 42px 44px;
  }
}
@media (max-width: 1100px) {
  .brand-panel {
    width: 52%;
    padding-left: 5%;
    padding-right: 5%;
  }
  .form-panel {
    width: 48%;
    padding-right: 30px;
  }
  .dashboard-art {
    transform: scale(0.9);
    transform-origin: left center;
  }
  h1 {
    font-size: 36px;
  }
}
@media (max-width: 760px) {
  .login {
    flex-direction: column;
    background: linear-gradient(145deg, #e6f3ff, #f5f8fd 65%);
  }
  .brand {
    top: 25px;
    left: 22px;
    font-size: 19px;
    gap: 8px;
  }
  .header {
    top: 18px;
    right: 12px;
    gap: 2px;
  }
  .brand-panel {
    display: none;
  }
  .form-panel {
    width: 100%;
    flex: 1;
    min-height: 100dvh;
    padding: 112px 22px 75px;
  }
  .form {
    max-width: 420px;
    padding: 35px 26px 30px;
    border-radius: 20px;
  }
  .page-footer {
    bottom: 25px;
  }
  .form-description {
    margin-bottom: 25px;
  }
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition: none !important;
  }
}
</style>
