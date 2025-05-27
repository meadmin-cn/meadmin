import { CodeEunm } from '@/dict/code.enum.js';
import { ApiProperty } from '@midwayjs/swagger';

export class ApiBaseRes {
  @ApiProperty({
    description:
      '状态码:200=成功;401=未登录;403=没有权限;400=失败(业务错误);402=校验失败;500=系统异常',
  })
  code: CodeEunm;
  @ApiProperty({ description: '状态信息' })
  message: string;
}
