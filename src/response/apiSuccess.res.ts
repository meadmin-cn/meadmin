import { CodeEunm } from '@/dict/code.enum.js';
import { ApiBaseRes } from './apiBase.res.js';
import { ApiProperty, Type } from '@midwayjs/swagger';

export class EmptyClass {}

export class ApiSuccessRes<T extends NonNullable<any>> extends ApiBaseRes {
  declare code: CodeEunm.Success;
  @ApiProperty({ description: '数据,code非200时值为undefined',type:'object' })
  data: T;
}

export function ApiSuccessWapper<T>(
  ResourceCls: Type<T>
): Type<ApiSuccessRes<T>> {
  class Successed extends ApiSuccessRes<T> {
    @ApiProperty({
      type: ResourceCls,
    })
    declare data: T;
  }
  return Successed;
}
