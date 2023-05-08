import { OpenAPIObject, SwaggerDocumentOptions } from '@nestjs/swagger';
export interface SwaggerDocumentConfig {
  module: string;
  config: Omit<OpenAPIObject, 'paths'>;
  options?: SwaggerDocumentOptions;
}
