import { ApiPropertyRule } from '@/decorators/index.js';
import { PageDto } from '@/dto/page.dto.js';
import { IntersectionType, PartialType } from '@/helper/dto.js';
import { RuleType } from '@/ruleType/index.js';

/**
 * 伪静态规则保存参数。
 * pattern 使用 nginx location 风格写法：`= /path`（精确）、`^~ /path`（前缀优先）、
 * `~ ^/article/([0-9]+)$`（正则）；不带修饰符时按 `/path/:param` 结构化路径匹配。
 */
export class SystemRewriteSaveDto {
  @ApiPropertyRule({ description: '站点ID', rule: RuleType.string().required() })
  siteId: string;

  @ApiPropertyRule({ description: 'URL 模式，如 = / 、~ ^/category/([^/]+)$', rule: RuleType.string().max(500).min(1).required() })
  pattern: string;

  @ApiPropertyRule({ description: '目标前端路由，正则分组用 $1 引用，如 /aon/cms/category/$1', rule: RuleType.string().max(500).min(1).required() })
  target: string;

  @ApiPropertyRule({ description: '状态：1启用，0禁用', rule: RuleType.number().integer().valid(0, 1) })
  status: number;

  @ApiPropertyRule({ description: '排序值', rule: RuleType.number().integer().min(0) })
  orderNum: number;

  @ApiPropertyRule({ description: '备注', rule: RuleType.string().max(500).allow('') })
  remark: string;
}

/** 编译预览参数 */
export class SystemRewriteCompileDto {
  @ApiPropertyRule({ description: 'URL 模式', rule: RuleType.string().max(500).min(1).required() })
  pattern: string;

  @ApiPropertyRule({ description: '目标前端路由', rule: RuleType.string().max(500).min(1).required() })
  target: string;
}

export class SystemRewriteUpdateDto extends PartialType(SystemRewriteSaveDto) {}

export class SystemRewriteQueryDto extends IntersectionType(PageDto, PartialType(SystemRewriteSaveDto)) {
  @ApiPropertyRule({ description: 'URL 模式/目标路由关键字', rule: RuleType.string().allow('') })
  keyword?: string;
}
