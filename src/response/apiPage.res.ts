import { ApiProperty, Type } from '@midwayjs/swagger';
import { ApiSuccessRes } from './apiSuccess.res.js';

export class PageRes<T = any> {
  @ApiProperty({ description: '分页页码',type:'integer' })
  page: number;
  @ApiProperty({ description: '每页记录数',type:'integer' })
  size: number;
  @ApiProperty({ description: '总数量',type:'integer' })
  total: number;
  @ApiProperty({ description: '列表数据', type:'array', items:{type:'object'} })
  list: T[];
}

export class ApiPageRes<T = any> extends ApiSuccessRes<PageRes<T>> {}

export function ApiPageWapper<T>(ResourceCls: Type<T>): Type<ApiPageRes<T>> {
  class SuccessedPage extends PageRes<T> {
    @ApiProperty({
      type: 'array',
      items: {
        type: ResourceCls,
      },
      description: '列表数据',
    })
    declare list: T[];
  }
  class Successed extends ApiPageRes<T> {
    @ApiProperty({
      type: SuccessedPage,
    })
    declare data: SuccessedPage;
  }
  return Successed;
}
