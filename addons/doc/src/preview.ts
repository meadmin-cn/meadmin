// 官网只使用预览入口，不加载编辑器、格式化、裁剪及全屏扩展。
import highlight from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { config, MdCatalog, MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import mermaid from 'mermaid';

// 高亮、公式和图表属于文档展示能力，保留本地依赖以兼容已有内容。
config({
  editorExtensions: {
    highlight: { instance: highlight },
    katex: { instance: katex },
    mermaid: { instance: mermaid },
  },
});

export { MdCatalog, MdPreview };
