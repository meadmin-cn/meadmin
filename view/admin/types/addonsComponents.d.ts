declare module 'vue' {
  export interface GlobalComponents {
    AonDocMdEditor: (typeof import('../src/addons/doc/components/aonDocMdEditor.vue'))['default'];
    //code
  }
}
declare global {
  type AonDocMdEditorInstance = InstanceType<(typeof import('../src/addons/doc/components/aonDocMdEditor.vue'))['default']>;
  //typeCode
}
export {};
