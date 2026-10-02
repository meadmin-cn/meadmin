import DOMPurify from 'dompurify';
export const sanitizeCmsHtml = (html: string) => {
  // SSR 不执行不具备 DOM 的净化器；客户端挂载后渲染预览。
  if (typeof window === 'undefined') return '';
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    // 仅禁用可注入脚本/表单/外嵌的标签；保留 <style> 标签禁用（防止整段 CSS 注入），
    // 但允许元素上的 style 属性（wangEditor 的颜色/字号/对齐/背景等内联格式），DOMPurify 会净化其中的危险值。
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'iframe', 'object', 'embed', 'script', 'link', 'meta'],
    FORBID_ATTR: ['srcset'],
    ADD_ATTR: ['target', 'rel'],
  });
};
