import elementIconLoaders from 'virtual:me-element-icons';
import type { App, Component } from 'vue';
import { defineAsyncComponent, defineComponent, h } from 'vue';

export const elIConNames = [] as string[];
export const svgIconNames = [] as string[];
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
  // 保留完整名称供动态菜单及选择器使用，组件代码仅在渲染时加载。
  for (const name of Object.keys(elementIconLoaders).sort()) {
    componentIcon(`MelIcon${name}`, elementIconLoaders[name as keyof typeof elementIconLoaders]);
    elIConNames.push(`MelIcon${name}`);
  }
  const svgModules = import.meta.glob<Component>('./svg/*.svg', { import: 'default' });
  for (const [file, loader] of Object.entries(svgModules)) {
    const name = file.slice(file.lastIndexOf('/') + 1, -4);
    const componentName = 'MeIcon' + name.charAt(0).toUpperCase() + name.slice(1);
    componentIcon(componentName, loader);
    svgIconNames.push(componentName);
  }
}
