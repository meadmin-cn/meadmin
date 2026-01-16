import { CodeEunm } from '@/dict/code.enum.js';
import { ApiProperty } from '@midwayjs/swagger';
import { ApiBaseRes } from './apiBase.res.js';

export class EmptyClass {}

export class ApiSuccessRes<T extends NonNullable<any>> extends ApiBaseRes {
  declare code: CodeEunm.Success;
  @ApiProperty({ description: '数据,code非200时值为undefined', type: 'object' })
  data: T;
}

export class ApiSuccessResArr<T extends NonNullable<any>> extends ApiBaseRes {
  declare code: CodeEunm.Success;
  @ApiProperty({ description: '数据,code非200时值为undefined', type: 'array' })
  data: T;
}
