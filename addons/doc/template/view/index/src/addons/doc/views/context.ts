import type { InjectionKey, Ref } from 'vue';
import type { AonDocConfigInfo, AonDocMenuTree } from '../api/aonDoc';

// doc 插件页面共享数据：由 views/layout.vue 请求后 provide，内层布局/页面 inject 使用，避免重复请求
export type AonDocContext = {
  menus: Ref<AonDocMenuTree>; //文档菜单树（当前版本）
  version: Ref<string>; //当前版本标识（路由参数，可能为空）
  config: Ref<AonDocConfigInfo | undefined>; //文档配置（版本列表、外链等）
};

export const aonDocContextKey: InjectionKey<AonDocContext> = Symbol('aonDocContext');
