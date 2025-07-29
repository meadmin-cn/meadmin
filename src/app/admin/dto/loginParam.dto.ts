import { ApiPropertyRule } from '@/decorators/index.js';
import { RuleType } from '@midwayjs/validate';

export class LoginParamDto {
  @ApiPropertyRule({ description: '用户名', rule: RuleType.string().max(10).min(1).required().empty('') })
  username: string;
  @ApiPropertyRule({ description: '密码', rule: RuleType.string().required().empty('') })
  password: string;
}
