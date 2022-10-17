import {
  InfoObject,
  ServerObject,
  ExternalDocumentationObject,
} from '@midwayjs/swagger';
export interface MeSwaggerConfigModule {
  name: string;
  pathRule: (path: string) => boolean;
  info?: InfoObject; //详情
  servers?: ServerObject[]; //为该路径中的所有操作提供服务的备用服务器数组。
  externalDocs?: ExternalDocumentationObject; //额外的文档
}
export interface MeSwaggerConfig {
  prefix?: string; //swagger资源前缀
  module?: Record<string, MeSwaggerConfigModule>;
}
