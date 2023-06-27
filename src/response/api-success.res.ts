import { CodeEnum } from '@/dict/code.enum';
import { ApiBaseRes } from './api-base.res';
import { ApiProperty } from '@meadmin/nest-swagger';

/**
 * 基础Ok响应类
 */
export class ApiSuccessRes<T extends NonNullable<any>> extends ApiBaseRes {
  @ApiProperty({ enum: [CodeEnum.Success] })
  code: CodeEnum.Success;
  @ApiProperty({ description: '数据code非200时值为undefined' })
  data: T;
}
