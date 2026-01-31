/**
 * @description User-Service parameters
 */
export interface IUserOptions {
  uid: number;
}

declare module '@midwayjs/core' {
  export interface MidwayConfig {
    debug?: boolean;
  }
}
