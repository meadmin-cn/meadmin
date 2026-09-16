import { ApiPropertyRule } from '@/decorators/index.js';
import { RuleType } from '@/ruleType/index.js';

export class SystemConfigGroupSortDto {
  @ApiPropertyRule({ description: '待移动的自定义配置组 ID', rule: RuleType.string().required() })
  groupId: string;

  @ApiPropertyRule({ description: '目标自定义配置组 ID', rule: RuleType.string().required() })
  targetGroupId: string;
}
