import { ApiPropertyRule } from '@/decorators/index.js';
import { PageDto } from '@/dto/page.dto.js';
import { IntersectionType, PartialType } from '@/helper/dto.js';
import { RuleType } from '@/ruleType/index.js';

/**
 * 站点保存参数。domains 以字符串数组形式提交，落库时统一序列化为 JSON 字符串。
 */
export class SystemSiteSaveDto {
  @ApiPropertyRule({ description: '站点名称', rule: RuleType.string().max(100).min(1).required() })
  name: string;

  @ApiPropertyRule({ description: '绑定域名', type: 'array', items: { type: 'string' }, rule: RuleType.array().items(RuleType.string().max(200)).required() })
  domains: string[];

  @ApiPropertyRule({ description: '根路径映射目标，如 /aon/cms', rule: RuleType.string().max(500).allow('') })
  basePath: string;

  @ApiPropertyRule({ description: '状态：1启用，0禁用', rule: RuleType.number().integer().valid(0, 1) })
  status: number;

  @ApiPropertyRule({ description: '排序值', rule: RuleType.number().integer().min(0) })
  orderNum: number;

  @ApiPropertyRule({ description: '备注', rule: RuleType.string().max(500).allow('') })
  remark: string;
}

export class SystemSiteUpdateDto extends PartialType(SystemSiteSaveDto) {}

export class SystemSiteQueryDto extends IntersectionType(PageDto, PartialType(SystemSiteSaveDto)) {
  @ApiPropertyRule({ description: '站点名称/域名关键字', rule: RuleType.string().allow('') })
  keyword?: string;
}
