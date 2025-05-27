import type { Options } from '@sequelize/core';
import type { PostgresDialect } from '@sequelize/postgres';

/**
 * @description User-Service parameters
 */
export interface IUserOptions {
  uid: number;
}

declare module '@midwayjs/core' {
  export interface MidwayConfig {
    debug?: boolean;
    database: Options<PostgresDialect>;
  }
}
