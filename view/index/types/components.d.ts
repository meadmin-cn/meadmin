declare module 'vue' {
  export interface GlobalComponents {
    MeButton: typeof import('../src/components/meButton.vue')['default'];
    MeComponent: typeof import('../src/components/meComponent')['default'];
    MeNumber: typeof import('../src/components/meNumber.vue')['default'];
    MeDialog: typeof import('../src/components/meDialog/index.vue')['default'];
    MeWangEditor: typeof import('../src/components/meWangEditor/index.vue')['default'];
    MeVxeTable: typeof import('../src/components/meVxeTable/index.vue')['default'];
    //code
  }
}
declare global {
  type MeButtonInstance = InstanceType<typeof import('../src/components/meButton.vue')['default']>;
  type MeComponentInstance = InstanceType<typeof import('../src/components/meComponent')['default']>;
  type MeNumberInstance = InstanceType<typeof import('../src/components/meNumber.vue')['default']>;
  type MeDialogInstance = InstanceType<typeof import('../src/components/meDialog/index.vue')['default']>;
  type MeWangEditorInstance = InstanceType<typeof import('../src/components/meWangEditor/index.vue')['default']>;
  type MeVxeTableInstance = InstanceType<typeof import('../src/components/meVxeTable/index.vue')['default']>;
  //typeCode
}
export {};
