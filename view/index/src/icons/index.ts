import elementIconLoaders from 'virtual:me-element-icons';
import type { App, Component } from 'vue';
import { defineAsyncComponent, defineComponent, h } from 'vue';

export function installIcon(app: App) {
  function componentIcon(name: string, loader: () => Promise<Component>) {
    const iconComponent = defineAsyncComponent(loader);
    app.component(
      name,
      defineComponent({
        props: {
          size: [Number, String],
          color: String,
        },
        setup(props) {
          return () =>
            h(
              'i',
              {
                class: 'el-icon',
                style: {
                  fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
                  color: props.color,
                },
              },
              h(iconComponent),
            );
        },
      }),
    );
  }

  // 全量注册轻量异步入口，包含字符串动态引用的图标；渲染时才加载组件代码。
  for (const [name, loader] of Object.entries(elementIconLoaders)) {
    componentIcon(`MelIcon${name}`, loader);
  }
  const svgModules = import.meta.glob<Component>('./svg/*.svg', { import: 'default' });
  for (const [file, loader] of Object.entries(svgModules)) {
    const name = file.slice(file.lastIndexOf('/') + 1, -4);
    componentIcon('MeIcon' + name.charAt(0).toUpperCase() + name.slice(1), loader);
  }
}
