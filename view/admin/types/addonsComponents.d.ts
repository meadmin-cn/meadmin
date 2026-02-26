declare module "vue" {
  export interface GlobalComponents {
    DocComponentsAonDocMdEditor: typeof import("../src/addons/doc/components/aonDocMdEditor.vue")["default"];
    //code
  }
}
declare global {
  type DocComponentsAonDocMdEditorInstance = InstanceType<
    typeof import("../src/addons/doc/components/aonDocMdEditor.vue")["default"]
  >;
  //typeCode
}
export {};
