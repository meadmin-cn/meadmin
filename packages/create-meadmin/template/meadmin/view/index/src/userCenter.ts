import type { Component } from 'vue';

export interface UserCenterMenuItem {
  key: string;
  title: string;
  path: string;
  icon?: Component;
  component: Component;
  order?: number;
}

const items = new Map<string, UserCenterMenuItem>();

export const registerUserCenterMenu = (item: UserCenterMenuItem) => {
  items.set(item.key, item);
};

export const getUserCenterMenus = () => [...items.values()].sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
