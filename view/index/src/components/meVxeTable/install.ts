import type { App, Component } from 'vue';
import { defineAsyncComponent, defineComponent, getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue';

const componentNames = ['VxeModal', 'VxeTable', 'VxeColumn', 'VxeColgroup', 'VxeGrid', 'VxeToolbar'] as const;
type ComponentName = (typeof componentNames)[number];
let modulesPromise: Promise<Record<ComponentName, Component>> | undefined;
const installedApps = new WeakMap<App, Promise<Record<ComponentName, Component>>>();
const ServerPlaceholder = defineComponent({ render: () => null });

// 所有浏览器专用依赖及样式都在首次使用表格时加载；并发请求共用同一个 Promise。
function loadModules() {
  return (modulesPromise ??= Promise.all([import('vxe-pc-ui'), import('vxe-table'), import('vxe-table-plugin-element'), import('vxe-pc-ui/es/style.css'), import('vxe-table/es/style.css'), import('vxe-table-plugin-element/dist/style.css')])
    .then(([ui, table, plugin]) => {
      ui.VxeUI.use(plugin.default);
      return {
        VxeModal: ui.VxeModal,
        VxeTable: table.VxeTable,
        VxeColumn: table.VxeColumn,
        VxeColgroup: table.VxeColgroup,
        VxeGrid: table.VxeGrid,
        VxeToolbar: table.VxeToolbar,
      };
    })
    .catch((error) => {
      modulesPromise = undefined;
      throw error;
    }));
}

export function loadVxeTable(app: App) {
  if (import.meta.env.SSR) throw new Error('VXE 只能在客户端加载');
  let pending = installedApps.get(app);
  if (!pending) {
    pending = loadModules()
      .then((components) => {
        for (const name of componentNames) app.component(name, components[name]);
        return components;
      })
      .catch((error) => {
        installedApps.delete(app);
        throw error;
      });
    installedApps.set(app, pending);
  }
  return pending;
}

// 启动时只注册异步入口，不下载 VXE；SSR 使用空占位避免执行 DOM 依赖。
export function initVxeTable(app: App) {
  for (const name of componentNames) {
    app.component(name, import.meta.env.SSR ? ServerPlaceholder : defineAsyncComponent(() => loadVxeTable(app).then((components) => components[name])));
  }
}

// 表格包装组件等待所有表格/列组件同步注册后再渲染，避免异步列丢失或 ref 未就绪。
export function useVxeTableReady() {
  const app = getCurrentInstance()!.appContext.app;
  const ready = ref(false);
  let disposed = false;
  onBeforeUnmount(() => {
    disposed = true;
  });
  onMounted(async () => {
    await loadVxeTable(app);
    if (!disposed) ready.value = true;
  });
  return ready;
}
