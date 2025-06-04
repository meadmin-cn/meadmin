import { ApiProperty } from '@midwayjs/swagger';
import { ApiSuccessRes } from './apiSuccess.res.js';

export class PageRes<T = any> {
  @ApiProperty({ description: '分页页码', type: 'integer' })
  page: number;
  @ApiProperty({ description: '每页记录数', type: 'integer' })
  size: number;
  @ApiProperty({ description: '总数量', type: 'integer' })
  total: number;
  @ApiProperty({
    description: '列表数据',
    type: 'array',
    items: { type: 'object' },
  })
  list: T[];
}

export class ApiPageRes<T = any> extends ApiSuccessRes<PageRes<T>> {}
