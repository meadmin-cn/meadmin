import { CodeEnum } from '@/dict/code.enum';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 基础响应类
 */
export class ApiBaseRes {
  @ApiProperty({ description: '状态码' })
  code: CodeEnum;
  @ApiProperty({ description: '状态信息' })
  message: string;
}
