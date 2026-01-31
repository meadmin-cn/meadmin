import { event, mitter } from '@/event';
import { Component, VNode } from 'vue';
const WIDTH = 992; // refer to Bootstrap's responsive design
const isMobile = ref(false);
if (!import.meta.env.SSR) {
  isMobile.value = window.document.body.offsetWidth < WIDTH;
}
mitter.on(event.RESIZE, () => {
  isMobile.value = window.document.body.offsetWidth < WIDTH;
});
export default defineStore('global', {
  state: () => {
    return {
      isMobile,
      layoutLoaded: false,
      globalComponents: [] as Array<{
        component: Component | VNode;
        key: number | string | symbol;
        props?: Record<string, any>;
        vnode?: Component;
      }>, //全局组件会渲染到app下
    };
  },
  actions: {
    addGlobalComponents(component: Component | VNode, props?: Record<string, any>, key?: number | string | symbol) {
      if (!key) {
        key = Symbol('componentKey');
      }
      this.globalComponents.push({
        component: markRaw(component),
        props,
        key,
      });
      return key;
    },
    removeGlobalComponents(key: number | string | symbol) {
      const index = this.globalComponents.findIndex((item) => item.key === key);
      if (index > -1) {
        this.globalComponents.splice(index, 1);
        return true;
      }
      return false;
    },
    getVnode<T extends Component>(key: number | string | symbol) {
      const index = this.globalComponents.findIndex((item) => item.key === key);
      if (index > -1) {
        return this.globalComponents[index].vnode as T;
      }
      return undefined;
    },
  },
});
