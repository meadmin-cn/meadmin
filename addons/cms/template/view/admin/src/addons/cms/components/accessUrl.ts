/**
 * 前台访问地址生成与复制。
 * 文章、栏目、自定义表单在列表里都需要展示可复制的前台地址，这里统一收口生成规则，
 * 避免各页面硬编码路径，前台路由调整时只改这一处即可。
 */
/** 前台 CMS 路由前缀，与 view/index 中 addons/cms 的路由 base 保持一致 */
export const CMS_FRONT_PREFIX = '/aon/cms';

const trim = (value?: string | null): string => (value ?? '').trim();

/**
 * 前台站点根地址：默认与后台同源部署（后台位于 VIEW_ADMIN_PATH_PRE 前缀下，前台在站点根路径）。
 * 若前后台分域名部署，可在部署环境变量里配置 VIEW_ADMIN_CMS_INDEX_URL 指定前台根地址。
 */
const frontRoot = (): string => {
  const custom = (import.meta.env as unknown as Record<string, string | undefined>).VIEW_ADMIN_CMS_INDEX_URL;
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  return (custom || origin).replace(/\/+$/, '');
};

/** 前台站点根地址，供列表单元格省略同源域名时使用 */
export const cmsFrontRoot = (): string => frontRoot();

/** 站内路径转完整访问地址 */
export const cmsFrontUrl = (path: string): string => {
  const value = trim(path);
  if (!value) return '';
  const root = frontRoot();
  if (!root) return value;
  return `${root}${value.startsWith('/') ? value : `/${value}`}`;
};

/** 外链可能是站内路径也可能是完整网址，统一成可访问地址 */
export const cmsAbsoluteUrl = (link?: string | null): string => {
  const value = trim(link);
  if (!value) return '';
  return /^(https?:)?\/\//i.test(value) ? value : cmsFrontUrl(value);
};

/** 文章详情页：/aon/cms/article/{slug} */
export const cmsArticleUrl = (slug?: string | null): string => (trim(slug) ? cmsFrontUrl(`${CMS_FRONT_PREFIX}/article/${slug}`) : '');

/** 栏目页：跳转链接型栏目直接访问其外链，其余走栏目列表页 */
export const cmsCategoryUrl = (row?: { slug?: string | null; type?: number | null; linkUrl?: string | null }): string => {
  if (!row) return '';
  if (Number(row.type) === 3) return cmsAbsoluteUrl(row.linkUrl);
  return trim(row.slug) ? cmsFrontUrl(`${CMS_FRONT_PREFIX}/category/${row.slug}`) : '';
};

/** 自定义表单页：/aon/cms/form/{diyname} */
export const cmsDiyformUrl = (diyname?: string | null): string => (trim(diyname) ? cmsFrontUrl(`${CMS_FRONT_PREFIX}/form/${diyname}`) : '');

/** 复制文本：优先用剪贴板 API，非安全上下文（http 访问）下退回临时输入框 */
export const copyText = async (text: string): Promise<boolean> => {
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 权限被拒绝或非安全上下文时走下面的兜底方案
  }
  try {
    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.top = '-1000px';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(input);
    return ok;
  } catch {
    return false;
  }
};
