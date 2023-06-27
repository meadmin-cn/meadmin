import { CodeEnum } from '@/dict/code.enum';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 基础响应类
 */
export class ApiBaseRes {
  @ApiProperty({
    description:
      '状态码:200=成功;401=未登录;403=没有权限;400=失败（业务错误）;500=异常',
  })
  code: CodeEnum;
  @ApiProperty({ description: '状态信息' })
  message: string;
}
