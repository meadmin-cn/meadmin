export * from './src/index';
export * from './types/midwayjs';
import { MeadminConfig } from './src/interfaces/index';
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    meadmin?: PowerPartial<MeadminConfig>;
  }
}
