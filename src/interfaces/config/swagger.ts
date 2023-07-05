import { SwaggerConfigOptions } from '@meadmin/nest-swagger';
export interface SwaggerConfig {
  open: boolean; // 是否启用swagger
  path: string; // 前缀
  useGlobalPrefix?: boolean;
  swaggers: SwaggerConfigOptions[];
}
