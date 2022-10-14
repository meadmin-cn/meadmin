import {
  InfoObject,
  ServerObject,
  ExternalDocumentationObject,
} from '@midwayjs/swagger';
export interface SwaggerOptions {
  path: string;
  module: Record<
    string,
    {
      name: string;
      pathsRule: (path: string) => boolean;
      tagsRule: (tags: string[]) => boolean;
      info?: InfoObject; //详情
      servers?: ServerObject[]; //为该路径中的所有操作提供服务的备用服务器数组。
      externalDocs?: ExternalDocumentationObject; //额外的文档
    }
  >;
}
