declare module 'vue' {
  export interface ComponentCustomProperties {
    VClickOutside: typeof import('../src/directives/clickOutside')['default'];
    //code
  }
}
export {};
