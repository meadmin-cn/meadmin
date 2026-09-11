<template>
  <div class="footer">
    <div class="footer-inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <router-link :to="PageEnum.HOME" class="brand">
            <me-icon-logo :size="30" style="fill: none" />
            <span class="brand-name">{{ globalStore.websiteName }}</span>
          </router-link>
          <p>基于 Midway + Vue 3 + TypeScript 的全栈一站式解决方案，让后台开发更简单、更优雅。</p>
          <p class="copyright">© 2025 - {{ year }}. All Rights Reserved. Power by MeAdmin</p>
        </div>
        <div class="footer-col">
          <h5>相关链接</h5>
          <router-link to="/aon/doc">文档</router-link>
          <a href="http://demo.meadmin.cn" rel="noopener">演示</a>
          <a href="http://demo.meadmin.cn/admin" rel="noopener">后台演示</a>
          <a :href="changelogUrl" rel="noopener">更新日志</a>
        </div>
        <div class="footer-col">
          <h5>支持</h5>
          <router-link to="/aon/doc">帮助</router-link>
          <a href="https://www.meadmin.cn" rel="noopener">反馈</a>
          <a href="https://www.meadmin.cn" rel="noopener">加入社区</a>
        </div>
        <div class="footer-col">
          <h5>联系</h5>
          <a href="https://www.meadmin.cn" rel="noopener">微信交流群</a>
          <a href="https://www.meadmin.cn" rel="noopener">QQ 交流群</a>
          <a href="https://www.meadmin.cn" rel="noopener">商务合作</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="LayoutFooter">
import { PageEnum } from '@/dict/pageEnum';
import { useGlobalStore } from '@/store';
import dayjs from 'dayjs';

// TODO: 替换为真实的更新日志地址
const changelogUrl = 'https://www.meadmin.cn/aon/doc';
const year = dayjs().year();
const globalStore = useGlobalStore();
</script>
<style lang="scss" scoped>
.footer {
  padding: 56px 0 36px;
  font-family: 'Plus Jakarta Sans', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif;
  color: #181c28;
}
/* 内容容器：footer 自管宽度，避免被布局的 .layout-footer > div 覆盖 padding */
.footer-inner {
  width: 1140px;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 16px;
  box-sizing: border-box;
}
.footer-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: 40px;
}
.footer-brand {
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    .brand-name {
      font-size: 19px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
  }
  p {
    margin: 16px 0 0;
    max-width: 34ch;
    font-size: 14.5px;
    line-height: 1.7;
    color: #6b7280;
  }
  .copyright {
    margin-top: 24px;
    font-size: 13px;
    color: #9aa1af;
  }
}
.footer-col {
  h5 {
    margin: 0 0 16px;
    font-size: 14px;
    font-weight: 700;
  }
  a {
    display: block;
    padding: 7px 0;
    font-size: 14px;
    color: #6b7280;
    transition: 0.2s;
    &:hover {
      color: #2b5cff;
    }
  }
}
@media (max-width: 720px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }
}
@media (max-width: 520px) {
  .footer {
    padding: 40px 0 28px;
  }
  .footer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
