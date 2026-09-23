import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
// 使用工作区已有的 jsdom，仅用于隔离安全测试，不作为插件运行时依赖。
const { JSDOM } = require('../../../node_modules/.pnpm/jsdom@16.7.0/node_modules/jsdom');
const dom = new JSDOM('');
Object.assign(globalThis, { window: dom.window });
const { sanitizeCmsHtml } = await import('../src/sanitize.js');
test('Markdown 净化保留正文并去除脚本、事件、危险协议、SVG 和嵌入内容', () => {
  const html = sanitizeCmsHtml('<h2>标题</h2><p><strong>正文</strong></p><script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">链接</a><iframe src="https://example.invalid"></iframe><svg onload="alert(1)"></svg><div style="background:url(x)">内容</div>');
  assert.match(html, /<h2>标题<\/h2>/);
  assert.match(html, /<strong>正文<\/strong>/);
  assert.doesNotMatch(html, /<script|onerror|javascript:|iframe|<svg|style=/i);
});
