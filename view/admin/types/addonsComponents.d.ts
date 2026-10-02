declare module 'vue' {
  export interface GlobalComponents {
    AccessUrl: (typeof import('../src/addons/cms/components/accessUrl'))['default'];
    AccessUrl: (typeof import('../src/addons/cms/components/accessUrl.vue'))['default'];
    ActionConfirm: (typeof import('../src/addons/cms/components/actionConfirm'))['default'];
    ActionConfirm: (typeof import('../src/addons/cms/components/actionConfirm.vue'))['default'];
    CmsPreview: (typeof import('../src/addons/cms/components/cmsPreview.vue'))['default'];
    RichTextView: (typeof import('../src/addons/cms/components/richTextView.vue'))['default'];
    AonDocMdEditor: (typeof import('../src/addons/doc/components/aonDocMdEditor.vue'))['default'];
    //code
  }
}
declare global {
  type AccessUrlInstance = InstanceType<(typeof import('../src/addons/cms/components/accessUrl'))['default']>;
  type AccessUrlInstance = InstanceType<(typeof import('../src/addons/cms/components/accessUrl.vue'))['default']>;
  type ActionConfirmInstance = InstanceType<(typeof import('../src/addons/cms/components/actionConfirm'))['default']>;
  type ActionConfirmInstance = InstanceType<(typeof import('../src/addons/cms/components/actionConfirm.vue'))['default']>;
  type CmsPreviewInstance = InstanceType<(typeof import('../src/addons/cms/components/cmsPreview.vue'))['default']>;
  type RichTextViewInstance = InstanceType<(typeof import('../src/addons/cms/components/richTextView.vue'))['default']>;
  type AonDocMdEditorInstance = InstanceType<(typeof import('../src/addons/doc/components/aonDocMdEditor.vue'))['default']>;
  //typeCode
}
export {};
