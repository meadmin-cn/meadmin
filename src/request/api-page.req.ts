import { ApiProperty } from '@meadmin/nest-swagger';
import { Min } from 'class-validator';

export class PageReq {
  @ApiProperty({ description: '页数' })
  @Min(1)
  page: number;
  @Min(1)
  @ApiProperty({ description: '每页记录数' })
  size: number;
}
