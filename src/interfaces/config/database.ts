import { Options } from '@sequelize/core';
export type DatabaseConfig = Options & {
  name?: string; //数据库连接名称用于区分多库配置 默认为default
};
