declare module 'vue' {
  export interface GlobalComponents {
    MeButton: (typeof import('../src/components/meButton.vue'))['default'];
    MeNumber: (typeof import('../src/components/meNumber.vue'))['default'];
    MeUpAvatar: (typeof import('../src/components/meUpAvatar.vue'))['default'];
    MeUpload: (typeof import('../src/components/meUpload.vue'))['default'];
    MeDialog: (typeof import('../src/components/meDialog/index.vue'))['default'];
    MeVxeTable: (typeof import('../src/components/meVxeTable/index.vue'))['default'];
    MeSelectFile: (typeof import('../src/components/meSelectFile/index.vue'))['default'];
    MeWangEditor: (typeof import('../src/components/meWangEditor/index.vue'))['default'];
    //code
  }
}
declare global {
  type MeButtonInstance = InstanceType<(typeof import('../src/components/meButton.vue'))['default']>;
  type MeNumberInstance = InstanceType<(typeof import('../src/components/meNumber.vue'))['default']>;
  type MeUpAvatarInstance = InstanceType<(typeof import('../src/components/meUpAvatar.vue'))['default']>;
  type MeUploadInstance = InstanceType<(typeof import('../src/components/meUpload.vue'))['default']>;
  type MeDialogInstance = InstanceType<(typeof import('../src/components/meDialog/index.vue'))['default']>;
  type MeVxeTableInstance = InstanceType<(typeof import('../src/components/meVxeTable/index.vue'))['default']>;
  type MeSelectFileInstance = InstanceType<(typeof import('../src/components/meSelectFile/index.vue'))['default']>;
  type MeWangEditorInstance = InstanceType<(typeof import('../src/components/meWangEditor/index.vue'))['default']>;
  //typeCode
}
export {};
