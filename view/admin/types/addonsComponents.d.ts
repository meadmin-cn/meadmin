declare module 'vue' {
  export interface GlobalComponents {
    CmsPreview: (typeof import('../src/addons/cms/components/cmsPreview.vue'))['default'];
    AonDocMdEditor: (typeof import('../src/addons/doc/components/aonDocMdEditor.vue'))['default'];
    //code
  }
}
declare global {
  type CmsPreviewInstance = InstanceType<(typeof import('../src/addons/cms/components/cmsPreview.vue'))['default']>;
  type AonDocMdEditorInstance = InstanceType<(typeof import('../src/addons/doc/components/aonDocMdEditor.vue'))['default']>;
  //typeCode
}
export {};
