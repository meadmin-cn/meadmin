import { ApiPropertyRule } from '@/decorators/index.js';
import { RuleType } from '@midwayjs/validate';

export class AdminProfileUpdateDto {
  @ApiPropertyRule({ description: '昵称', rule: RuleType.string().min(1).max(20).required() })
  nickname: string;

  @ApiPropertyRule({ description: '邮箱', rule: RuleType.string().email().max(100).allow('') })
  email?: string;

  @ApiPropertyRule({
    description: '手机号',
    rule: RuleType.string()
      .pattern(/^1\d{10}$/)
      .required(),
  })
  mobile: string;

  @ApiPropertyRule({ description: '头像', rule: RuleType.object({ id: RuleType.string().required() }).allow(null) })
  avatar?: { id: string } | null;

  @ApiPropertyRule({ description: '原密码', rule: RuleType.string().allow('') })
  oldPassword?: string;

  @ApiPropertyRule({ description: '新密码', rule: RuleType.string().min(6).max(20).allow('') })
  newPassword?: string;
}
