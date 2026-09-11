<template>
  <div class="footer">
    <div class="footer-inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <router-link :to="PageEnum.HOME" class="brand">
            <me-icon-logo :size="30" style="fill: none" />
            <span class="brand-name">{{ globalStore.websiteName }}</span>
          </router-link>
          <p class="copyright">© 2025 - {{ year }}. All Rights Reserved. Power by MeAdmin</p>
        </div>
        <div class="footer-col">
          <h5>支持</h5>
          <a href="https://github.com/meadmin-cn/meadmin/issues" rel="noopener">反馈</a>
          <a href="https://github.com/meadmin-cn/meadmin/issues" rel="noopener">加入社区</a>
        </div>
        <div class="footer-col">
          <h5>联系</h5>
          <a href="https://jq.qq.com/?_wv=1027&k=zSjWSant" rel="noopener">QQ 交流群</a>
          <a href="https://github.com/meadmin-cn/meadmin/issues" rel="noopener">商务合作</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="LayoutFooter">
import { PageEnum } from '@/dict/pageEnum';
import { useGlobalStore } from '@/store';
import dayjs from 'dayjs';

const year = dayjs().year();
const globalStore = useGlobalStore();
</script>
<style lang="scss" scoped>
.footer {
  padding: 18px 0 14px;
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
  grid-template-columns: 1.6fr 1fr 1fr;
  gap: 24px;
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
  .copyright {
    margin: 6px 0 0;
    font-size: 13px;
    color: #9aa1af;
  }
}
.footer-col {
  h5 {
    margin: 0 0 6px;
    font-size: 14px;
    font-weight: 700;
  }
  a {
    display: block;
    padding: 3px 0;
    font-size: 14px;
    color: #6b7280;
    transition: 0.2s;
    &:hover {
      color: #2b5cff;
    }
  }
}
@media (max-width: 720px) {
  /* 手机端：只保留品牌与版权信息，隐藏链接列 */
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .footer-col {
    display: none;
  }
}
@media (max-width: 520px) {
  .footer {
    padding: 16px 0 12px;
  }
}
</style>
