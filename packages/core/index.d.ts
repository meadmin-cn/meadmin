export * from './dist/index.d.ts';
import { customKey } from './dist/config/config.default';
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    book?: PowerPartial<typeof customKey>;
  }
}
