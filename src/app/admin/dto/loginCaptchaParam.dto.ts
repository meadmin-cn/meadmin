import { ApiPropertyRule } from '@/decorators/index.js';
import { RuleType } from '@midwayjs/validate';

export class LoginCaptchaParamDto {
  @ApiPropertyRule({ description: '宽度', rule: RuleType.number().default(100) })
  width: number;
  @ApiPropertyRule({ description: '高度', rule: RuleType.number().default(30) })
  height: number;
}
