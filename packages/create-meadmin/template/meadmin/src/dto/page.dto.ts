import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class PageDto {
  @ApiProperty({ description: '页数', default: 1, type: 'integer' })
  @Rule(RuleType.number().default(1))
  page: number;
  @Rule(RuleType.number().default(10))
  @ApiProperty({
    description: '每页记录数',
    default: 10,

    type: 'integer',
  })
  pageSize: number;
}
