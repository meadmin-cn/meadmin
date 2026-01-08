import "@midwayjs/busboy";

declare module '@midwayjs/busboy' {
  export interface UploadOptions{
    upDir:string;//文件存储文件夹
  }
}