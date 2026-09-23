import DOMPurify from 'dompurify';
export const sanitizeCmsHtml = (html: string) => {
  // SSR 不执行不具备 DOM 的净化器；客户端挂载后渲染预览。
  if (typeof window === 'undefined') return '';
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['style', 'srcset'],
  });
};
