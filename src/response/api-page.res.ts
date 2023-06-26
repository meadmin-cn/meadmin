import { ApiProperty } from '@meadmin/nest-swagger';
import { ApiSuccessRes } from './api-success.res';

export class PageRes<T = any> {
  @ApiProperty({ description: '分页页码' })
  page: number;
  @ApiProperty({ description: '每页记录数' })
  size: number;
  @ApiProperty({ description: '分页数据总量' })
  total: number;
  @ApiProperty({ description: '分页列表' })
  list: T[];
}

/**
 * 分页响应类
 */
export class ApiPagerRes<T = any> extends ApiSuccessRes<PageRes<T>> {}
