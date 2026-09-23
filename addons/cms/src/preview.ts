// 与 doc 复用同一 Markdown 预览组件，CMS 自行声明依赖并净化渲染输出。
export { MdPreview } from 'md-editor-v3';
export { sanitizeCmsHtml } from './sanitize';
import 'md-editor-v3/lib/preview.css';
