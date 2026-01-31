import { isFunction } from '@vue/shared';
import { ConcreteComponent } from 'vue';
export function getComponentName(Component: ConcreteComponent, includeInferred = true): string | false | undefined {
  return isFunction(Component) ? Component.displayName || Component.name : Component.name || (includeInferred && Component.__name);
}
