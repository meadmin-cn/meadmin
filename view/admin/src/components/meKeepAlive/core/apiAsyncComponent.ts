import { ComponentInternalInstance, ComponentOptions, VNode } from 'vue';

export const isAsyncWrapper = (i: ComponentInternalInstance | VNode): boolean => !!(i.type as ComponentOptions).__asyncLoader;
