import { ApiPropertyRule } from '@/decorators/index.js';

export class LoginResultDto {
  @ApiPropertyRule({ description: 'token' })
  token: string;
  @ApiPropertyRule({ description: '过期时间毫秒时间戳' })
  expiresInTime: number;
  @ApiPropertyRule({ description: '过期时间转义字符' })
  expiresInTimeStr: string;
}
