<template>
  <div class="cms-footer">
    <div class="cms-footer-container">
      <div class="cms-footer-grid">
        <div class="cms-footer-brand">
          <router-link to="/aon/cms" class="cms-brand">
            <span class="cms-brand-icon">📰</span>
            <span class="cms-brand-name">内容中心</span>
          </router-link>
          <p class="cms-footer-desc">发现精彩内容，探索知识海洋</p>
          <p class="cms-copyright">© {{ currentYear }} {{ globalStore.websiteName }}. 保留所有权利.</p>
          <a v-if="icpNumber" class="cms-icp" href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">
            {{ icpNumber }}
          </a>
        </div>

        <div class="cms-footer-col">
          <h5>快速导航</h5>
          <router-link to="/aon/cms">首页</router-link>
          <router-link to="/aon/cms?sortBy=views">热门文章</router-link>
          <router-link to="/aon/cms?sortBy=latest">最新发布</router-link>
          <router-link to="/aon/cms?sortBy=comments">评论最多</router-link>
        </div>

        <div class="cms-footer-col">
          <h5>关于我们</h5>
          <a href="/about" target="_blank">关于网站</a>
          <a href="/contact" target="_blank">联系我们</a>
          <a href="/join" target="_blank">加入我们</a>
          <a href="/privacy" target="_blank">隐私政策</a>
        </div>

        <div class="cms-footer-col">
          <h5>友情链接</h5>
          <a v-for="link in friendLinks" :key="link.url" :href="link.url" target="_blank" rel="noopener">
            {{ link.name }}
          </a>
        </div>
      </div>

      <div class="cms-footer-bottom">
        <p class="cms-footer-tech">Powered by <a href="https://github.com/meadmin-cn/meadmin" target="_blank" rel="noopener">MeAdmin</a></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/store';
import { computed } from 'vue';

const globalStore = useGlobalStore();

const currentYear = computed(() => new Date().getFullYear());

const icpNumber = computed(() => '粤ICP备12345678号-1');

const friendLinks = [
  { name: 'MeAdmin', url: 'https://github.com/meadmin-cn/meadmin' },
  { name: 'FastAdmin', url: 'https://www.fastadmin.net/' },
  { name: 'Element Plus', url: 'https://element-plus.org/' },
  { name: 'Vue.js', url: 'https://vuejs.org/' },
];
</script>

<style lang="scss" scoped>
:root {
  --cms-surface-0: #05070c;
  --cms-surface-1: #0a0d12;
  --cms-surface-2: #0f131c;
  --cms-surface-3: #161d2b;
  --cms-surface-4: #1e2636;
  --cms-accent: #38bdf8;
  --cms-accent-dim: #0ea5e9;
  --cms-text-primary: #f1f5f9;
  --cms-text-secondary: #94a3b8;
  --cms-text-tertiary: #64748b;
  --cms-border: rgba(148, 163, 184, 0.1);
  --cms-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.cms-footer {
  margin-top: auto;
  background: linear-gradient(to bottom, var(--cms-surface-1) 0%, var(--cms-surface-0) 100%);
  border-top: 1px solid var(--cms-border);
  font-family: 'Plus Jakarta Sans', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
}

.cms-footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: clamp(48px, 7vw, 72px) clamp(20px, 4vw, 40px) clamp(28px, 4.5vw, 36px);
}

.cms-footer-grid {
  display: grid;
  grid-template-columns: 1.6fr repeat(3, 1fr);
  gap: clamp(28px, 5vw, 56px);
  margin-bottom: clamp(40px, 6vw, 56px);
}

.cms-footer-brand {
  .cms-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-3px);
      filter: brightness(1.1);
    }
  }

  .cms-brand-icon {
    font-size: clamp(32px, 5vw, 40px);
    line-height: 1;
  }

  .cms-brand-name {
    font-size: clamp(1.125rem, 2.6vw, 1.375rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--cms-text-primary);
  }
}

.cms-footer-desc {
  margin: clamp(20px, 3vw, 24px) 0 0;
  max-width: 40ch;
  font-size: clamp(0.9375rem, 1.9vw, 1.0625rem);
  line-height: 1.75;
  color: var(--cms-text-secondary);
}

.cms-copyright {
  margin: clamp(16px, 2.5vw, 20px) 0 0;
  font-size: clamp(0.8125rem, 1.7vw, 0.9375rem);
  line-height: 1.6;
  color: var(--cms-text-tertiary);
}

.cms-icp {
  display: inline-block;
  margin-top: 10px;
  font-size: clamp(0.8125rem, 1.7vw, 0.875rem);
  color: var(--cms-text-tertiary);
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    color: var(--cms-accent);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}

.cms-footer-col {
  h5 {
    margin: 0 0 clamp(18px, 2.8vw, 22px);
    font-size: clamp(0.9375rem, 1.9vw, 1.0625rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--cms-text-primary);
    position: relative;
    padding-left: 14px;
  }

  h5::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 65%;
    background: linear-gradient(to bottom, var(--cms-accent), var(--cms-accent-dim));
    border-radius: 999px;
  }

  a {
    display: block;
    padding: 8px 0;
    font-size: clamp(0.875rem, 1.8vw, 0.9375rem);
    color: var(--cms-text-secondary);
    text-decoration: none;
    transition: all 0.25s ease;

    &:hover {
      color: var(--cms-accent);
      transform: translateX(6px);
    }
  }
}

.cms-footer-bottom {
  padding-top: clamp(28px, 4.5vw, 36px);
  border-top: 1px solid var(--cms-border);
  text-align: center;
}

.cms-footer-tech {
  margin: 0;
  font-size: clamp(0.8125rem, 1.7vw, 0.9375rem);
  color: var(--cms-text-tertiary);

  a {
    color: var(--cms-accent);
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover {
      color: var(--cms-accent-dim);
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }
}

@media (max-width: 960px) {
  .cms-footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: clamp(36px, 5vw, 40px) clamp(24px, 4vw, 28px);
  }

  .cms-footer-brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 640px) {
  .cms-footer-grid {
    grid-template-columns: 1fr;
    gap: clamp(32px, 5vw, 36px);
  }

  .cms-footer-col {
    h5 {
      margin-bottom: clamp(14px, 2.5vw, 16px);
    }

    a {
      padding: 7px 0;
    }
  }
}
</style>
