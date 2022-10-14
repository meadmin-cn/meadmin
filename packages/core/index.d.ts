export * from './src/index';
export * from './types/midwayjs';
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    meadmin?: PowerPartial<{
      a: number;
      b: string;
    }>;
  }
}
