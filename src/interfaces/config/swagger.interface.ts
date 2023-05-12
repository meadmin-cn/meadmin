import {
  SwaggerCustomOptions,
  SwaggerDocumentConfig,
} from '@meadmin/nest-swagger';
export interface SwaggerConfig extends SwaggerCustomOptions {
  open: boolean; // 是否启用swagger
  path: string; // 前缀
  documentConfig: (SwaggerDocumentConfig & { deepIncludes?: boolean })[];
}
