import { AdminPermission, ApiPropertyRule, InjectRepository } from '@/decorators/index.js';
import { AonCmsTag } from '@/entities/aonCmsTag.entity.js';
import { AonCmsTopic } from '@/entities/aonCmsTopic.entity.js';
import { RuleType } from '@/ruleType/index.js';
import { Body, Controller, Post } from '@midwayjs/core';
import { Op } from '@sequelize/core';
import { BaseController } from '../../../controller/base.controller.js';
import { validateCms } from '../service/guard.js';
import { CmsPermissionMiddleware } from './permission.middleware.js';

class CmsOptionsDto {
  @ApiPropertyRule({ rule: RuleType.string().max(100).allow('').default('') }) keyword: string;
  @ApiPropertyRule({
    rule: RuleType.array()
      .items(RuleType.string().pattern(/^[0-9]{1,20}$/))
      .max(30)
      .default([]),
  })
  ids: string[];
}
const schema = RuleType.object({
  keyword: RuleType.string().max(100).allow('').default(''),
  ids: RuleType.array()
    .items(RuleType.string().pattern(/^[0-9]{1,20}$/))
    .max(30)
    .default([]),
}).unknown(false);
@Controller('addons/cms/options', { middleware: [CmsPermissionMiddleware] })
export class AonCmsOptionsController extends BaseController {
  @InjectRepository(AonCmsTag) tags: typeof AonCmsTag;
  @InjectRepository(AonCmsTopic) topics: typeof AonCmsTopic;
  @Post('/tag')
  @AdminPermission(['aon_cms_article_add', 'aon_cms_article_edit', 'aon_cms_article_info'])
  async tag(@Body() input: CmsOptionsDto) {
    const q = validateCms<CmsOptionsDto>(schema, input);
    const selected = q.ids.length ? await this.tags.findAll({ attributes: ['id', 'title'], where: { id: { [Op.in]: q.ids } } }) : [];
    const rows = await this.tags.findAll({ attributes: ['id', 'title'], where: { title: { [Op.iLike]: '%' + q.keyword + '%' }, id: { [Op.notIn]: q.ids } }, limit: 50, order: [['title', 'ASC']] });
    return this.success([...selected, ...rows]);
  }
  @Post('/topic')
  @AdminPermission(['aon_cms_article_add', 'aon_cms_article_edit', 'aon_cms_article_info'])
  async topic(@Body() input: CmsOptionsDto) {
    const q = validateCms<CmsOptionsDto>(schema, input);
    const selected = q.ids.length ? await this.topics.findAll({ attributes: ['id', 'title'], where: { id: { [Op.in]: q.ids } } }) : [];
    const rows = await this.topics.findAll({ attributes: ['id', 'title'], where: { title: { [Op.iLike]: '%' + q.keyword + '%' }, id: { [Op.notIn]: q.ids } }, limit: 50, order: [['title', 'ASC']] });
    return this.success([...selected, ...rows]);
  }
}
