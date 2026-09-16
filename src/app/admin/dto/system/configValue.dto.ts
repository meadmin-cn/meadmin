import { ApiPropertyRule } from '@/decorators/index.js';
import { RuleType } from '@/ruleType/index.js';

export class SystemConfigValueItemDto {
  @ApiPropertyRule({ description: '变量名', rule: RuleType.string().min(1).max(100).required() })
  variableCode: string;

  @ApiPropertyRule({ description: '配置值，可根据变量类型传入字符串、数字、数组或对象' })
  value: unknown;

  @ApiPropertyRule({ description: '字典选项', type: 'array', items: { type: 'object' }, rule: RuleType.array().items(RuleType.object()) })
  options?: unknown[];
}

export class SystemConfigValueSaveDto {
  @ApiPropertyRule({ description: '当前组配置项', type: 'array', items: { type: () => SystemConfigValueItemDto }, rule: RuleType.array().items(RuleType.object()).min(1).required() })
  values: SystemConfigValueItemDto[];
}
