<template>
  <div class="footer" :class="{ 'show-mobile-links': mobileLinks }">
    <div class="footer-inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <a :href="brandUrl" class="brand">
            <me-icon-logo :size="30" style="fill: none" />
            <span class="brand-name">{{ brandName }}</span>
          </a>
          <p v-if="description">{{ description }}</p>
          <p v-if="copyright" class="copyright">{{ copyright }}</p>
          <a v-if="icpNumber" class="copyright" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=44031002000255" rel="nofollow" target="_blank">{{ icpNumber }}</a>
        </div>
        <div v-for="(column, index) in columns" :key="index" class="footer-col">
          <h5 v-if="column.title">{{ column.title }}</h5>
          <a v-for="(link, linkIndex) in column.links" :key="linkIndex" :href="link.url" :target="link.target" rel="noopener noreferrer">{{ link.text }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="LayoutFooter">
import { useGlobalStore } from '@/store';
import { getConfig } from '@/utils/helper';
import dayjs from 'dayjs';

type FooterLink = { text: string; url: string; target: '_self' | '_blank' };
type FooterColumn = { title: string; links: FooterLink[] };
const globalStore = useGlobalStore();
// 在 setup 内调用，沿用请求封装的 SSR 地址和服务端数据缓存。
const items = await getConfig<{ variableCode: string; value: unknown }[]>('site_footer').catch(() => []);
const values = Object.fromEntries(items.map((item) => [item.variableCode, item.value]));
const brandName = typeof values.brand_name === 'string' ? values.brand_name : globalStore.websiteName;
const description = values.description;
const safeUrl = (value: unknown) => {
  if (typeof value !== 'string') return '';
  const url = value.trim();
  if (
    [...url].some((char) => {
      const code = char.charCodeAt(0);
      return (code >= 0 && code <= 32) || char === '\\';
    })
  ) {
    return '';
  }
  return /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(url) ? url : '';
};
const brandUrl = safeUrl(values.brand_url) || '/';
const copyright = typeof values.copyright === 'string' ? values.copyright.replaceAll('{year}', String(dayjs().year())).replaceAll('{siteName}', brandName) : '';
const mobileLinks = values.mobile_links === 1;
const icpNumber = await getConfig<string>('base', 'icp_number');
// 多行文本存储 JSON，兼容现有后台编辑器；空数组表示主动隐藏所有栏目。
let rawColumns: unknown = values.columns;
if (typeof rawColumns === 'string') {
  try {
    rawColumns = JSON.parse(rawColumns);
  } catch {
    rawColumns = [];
  }
}
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const columns: FooterColumn[] = Array.isArray(rawColumns)
  ? rawColumns
      .filter(isObject)
      .filter((column) => column.enabled !== false && column.enabled !== 0)
      .map((column) => ({
        title: typeof column.title === 'string' ? column.title : '',
        links: Array.isArray(column.links)
          ? column.links
              .filter(isObject)
              .filter((link) => link.enabled !== false && link.enabled !== 0 && typeof link.text === 'string' && link.text && safeUrl(link.url))
              .map((link) => ({ text: link.text as string, url: safeUrl(link.url), target: link.target === '_blank' ? ('_blank' as const) : ('_self' as const) }))
          : [],
      }))
  : [];
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
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  .footer-brand {
    flex: 1.6 1 260px;
  }
  .footer-col {
    flex: 1 1 160px;
  }
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
    max-width: 38ch;
    font-size: 14.5px;
    line-height: 1.7;
    color: #6b7280;
  }
  .copyright {
    margin: 6px 0 0;
    max-width: 50ch;
    font-size: 13px;
    color: #9aa1af;
  }
  a.copyright:hover {
    color: #000;
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
    gap: 16px;
  }
  .footer-col {
    display: none;
  }
  .show-mobile-links .footer-col {
    display: block;
  }
}
@media (max-width: 520px) {
  .footer {
    padding: 16px 0 12px;
  }
}
</style>
