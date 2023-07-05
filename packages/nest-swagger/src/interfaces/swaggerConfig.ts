import {
  OpenAPIObject,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
export interface SwaggerConfigOptions {
  module: string;
  documentConfig: Omit<OpenAPIObject, 'paths'>;
  documentOptions?: SwaggerDocumentOptions;
  swaggerOptions?: SwaggerCustomOptions;
}
