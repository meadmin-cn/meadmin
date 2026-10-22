import { InjectRepository, Transaction } from '@/decorators/index.js';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { InferAttributes, Op } from '@sequelize/core';
import { WhereAttributeHash } from '@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/where-sql-builder-types.js';
import { SystemRewrite } from '../../../../entities/systemRewrite.entity.js';
import { SystemSite } from '../../../../entities/systemSite.entity.js';
import { compileRewriteRule } from '../../../../helper/rewritePattern.js';
import { SystemRewriteQueryDto, SystemRewriteSaveDto, SystemRewriteUpdateDto } from '../../dto/system/rewrite.dto.js';

@Provide()
export class SystemRewriteService {
  @InjectRepository(SystemRewrite)
  systemRewriteRepository: typeof SystemRewrite;

  @InjectRepository(SystemSite)
  systemSiteRepository: typeof SystemSite;

  @Inject()
  i18nService: MidwayI18nService;

  private badRequest(message: string): never {
    throw new BadRequestError(this.i18nService.translate(message));
  }

  private validateSavePayload(payload: Partial<SystemRewriteSaveDto>) {
    if (payload.pattern !== undefined) {
      if (!payload.pattern || payload.pattern.length > 500) this.badRequest('URL 模式必须是 1-500 个字符');
    }
    if (payload.target !== undefined) {
      if (!payload.target || payload.target.length > 500) this.badRequest('目标路由必须是 1-500 个字符');
      if (!payload.target.startsWith('/')) this.badRequest('目标路由必须以 / 开头');
    }
    if (payload.status !== undefined && payload.status !== 0 && payload.status !== 1) this.badRequest('规则 status 必须是 0 或 1');
    if (payload.orderNum !== undefined && (!Number.isInteger(payload.orderNum) || payload.orderNum < 0)) this.badRequest('规则排序值必须是非负整数');
  }

  /**
   * 编译预览：把 nginx 风格写法解析为实际生效的 alias 与目标路由，供配置页实时校验。
   */
  compile(pattern: string, target: string) {
    const compiled = compileRewriteRule(pattern, target);
    if (!compiled.ok) return { ok: false as const, error: compiled.error };
    return {
      ok: true as const,
      modifier: compiled.rule.modifier,
      kind: compiled.rule.kind,
      alias: compiled.rule.alias,
      target: compiled.rule.target,
    };
  }

  private async ensureSite(siteId: string) {
    const site = await this.systemSiteRepository.findByPk(siteId);
    if (!site) this.badRequest('没有对应的站点');
    return site;
  }

  @Transaction()
  async list(queryDto: SystemRewriteQueryDto) {
    const where = {} as WhereAttributeHash<InferAttributes<SystemRewrite>>;
    if (queryDto.siteId) where.siteId = queryDto.siteId;
    if (queryDto.status !== undefined) where.status = queryDto.status;
    if (queryDto.pattern) where.pattern = { [Op.like]: '%' + queryDto.pattern.replace(/[\\%_]/g, '\\$&') + '%' };
    if (queryDto.target) where.target = { [Op.like]: '%' + queryDto.target.replace(/[\\%_]/g, '\\$&') + '%' };
    if (queryDto.keyword) {
      const pattern = '%' + queryDto.keyword.replace(/[\\%_]/g, '\\$&') + '%';
      (where as Record<symbol, unknown>)[Op.or] = [{ pattern: { [Op.like]: pattern } }, { target: { [Op.like]: pattern } }, { remark: { [Op.like]: pattern } }];
    }
    const { count, rows } = await this.systemRewriteRepository.findAndCountAll({
      where,
      offset: (queryDto.page - 1) * queryDto.pageSize,
      limit: queryDto.pageSize,
      order: [
        ['orderNum', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
    return {
      // 附带编译结果，配置页可直接看到实际生效的别名与非法原因
      list: rows.map((row) => {
        const compiled = compileRewriteRule(row.pattern, row.target);
        return {
          ...row.toJSON(),
          compiled: compiled.ok ? { ok: true, modifier: compiled.rule.modifier, kind: compiled.rule.kind, alias: compiled.rule.alias, target: compiled.rule.target } : { ok: false, error: compiled.error },
        };
      }),
      total: count,
      page: queryDto.page,
      pageSize: queryDto.pageSize,
    };
  }

  @Transaction()
  async save(id: string | undefined, payload: SystemRewriteSaveDto | SystemRewriteUpdateDto) {
    this.validateSavePayload(payload);
    let entity: SystemRewrite | null = null;
    if (id) {
      entity = await this.systemRewriteRepository.findByPk(id);
      if (!entity) this.badRequest('没有对应的规则');
    }
    const siteId = payload.siteId ?? entity?.siteId;
    if (!siteId) this.badRequest('缺少站点ID');
    await this.ensureSite(siteId);
    const pattern = payload.pattern ?? entity?.pattern;
    if (!pattern) this.badRequest('缺少 URL 模式');
    const target = payload.target ?? entity?.target ?? '';
    if (!target) this.badRequest('缺少目标路由');
    // URL 模式用 nginx location 语法书写，保存前先编译校验，避免非法写法落库后静默失效
    const compiled = compileRewriteRule(pattern, target);
    if (!compiled.ok) this.badRequest(compiled.error);
    const duplicate = await this.systemRewriteRepository.findOne({ where: { siteId, pattern } });
    if (duplicate && duplicate.id !== entity?.id) this.badRequest('当前站点已存在相同的 URL 模式');
    if (!entity) {
      const created = await this.systemRewriteRepository.create({ siteId, pattern, target: '', status: 1, orderNum: 0, remark: '', ...payload } as never);
      return created;
    }
    Object.assign(entity, payload);
    return await entity.save();
  }

  @Transaction()
  async remove(id: string) {
    const entity = await this.systemRewriteRepository.findByPk(id);
    if (!entity) this.badRequest('没有对应的规则');
    await entity.destroy();
  }
}
