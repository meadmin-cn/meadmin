import { InjectRepository, Transaction } from '@/decorators/index.js';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { InferAttributes, Op } from '@sequelize/core';
import { WhereAttributeHash } from '@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/where-sql-builder-types.js';
import { SystemRewrite } from '../../../../entities/systemRewrite.entity.js';
import { SystemSite } from '../../../../entities/systemSite.entity.js';
import { CompiledRewrite, compileRewriteRules } from '../../../../helper/rewritePattern.js';
import { SystemSiteQueryDto, SystemSiteSaveDto, SystemSiteUpdateDto } from '../../dto/system/site.dto.js';

export type SiteConfigRule = CompiledRewrite;
export type SiteConfig = {
  id: string;
  name: string;
  basePath: string;
  rules: SiteConfigRule[];
};

/**
 * 把用户填写的域名规范化为小写主机名：去掉协议、路径、端口与尾部点。
 */
export function normalizeHost(host: string): string {
  return (host || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .replace(/:\d+$/, '')
    .replace(/\.$/, '');
}

/** 去掉尾部斜杠；根路径保留为空串时的 '/'。 */
export function normalizeBasePath(value: string | undefined | null): string {
  return (value ?? '').trim().replace(/\/+$/, '');
}

@Provide()
export class SystemSiteService {
  @InjectRepository(SystemSite)
  systemSiteRepository: typeof SystemSite;

  @InjectRepository(SystemRewrite)
  systemRewriteRepository: typeof SystemRewrite;

  @Inject()
  i18nService: MidwayI18nService;

  private badRequest(message: string): never {
    throw new BadRequestError(this.i18nService.translate(message));
  }

  /** 解析库内的域名字段；兼容历史/手工录入的逗号、换行分隔格式。 */
  parseDomains(raw: string | null | undefined): string[] {
    const value = (raw ?? '').trim();
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((item) => normalizeHost(String(item))).filter(Boolean);
      if (typeof parsed === 'string') return [normalizeHost(parsed)].filter(Boolean);
    } catch {
      // 非 JSON 时按分隔符解析，避免手工改库导致站点直接失效。
    }
    return value
      .split(/[\s,，;；]+/)
      .map((item) => normalizeHost(item))
      .filter(Boolean);
  }

  private domainsToString(domains: string[]): string {
    return JSON.stringify(Array.from(new Set(domains.map((item) => normalizeHost(item)).filter(Boolean))));
  }

  private siteResponse(site: SystemSite) {
    return { ...site.toJSON(), domains: this.parseDomains(site.domains) };
  }

  private validateSavePayload(payload: Partial<SystemSiteSaveDto>) {
    if (payload.name !== undefined && (!payload.name || payload.name.length > 100)) this.badRequest('站点名称必须是 1-100 个字符');
    if (payload.basePath !== undefined && payload.basePath.length > 500) this.badRequest('根路径映射不能超过 500 个字符');
    if (payload.basePath !== undefined && payload.basePath.trim() && !payload.basePath.trim().startsWith('/')) this.badRequest('根路径映射必须以 / 开头');
    if (payload.status !== undefined && payload.status !== 0 && payload.status !== 1) this.badRequest('站点 status 必须是 0 或 1');
    if (payload.orderNum !== undefined && (!Number.isInteger(payload.orderNum) || payload.orderNum < 0)) this.badRequest('站点排序值必须是非负整数');
    if (payload.domains !== undefined && payload.domains.some((domain) => normalizeHost(domain).length > 200)) this.badRequest('单个域名不能超过 200 个字符');
  }

  @Transaction()
  async list(queryDto: SystemSiteQueryDto) {
    const where = {} as WhereAttributeHash<InferAttributes<SystemSite>>;
    if (queryDto.name) where.name = { [Op.like]: '%' + queryDto.name.replace(/[\\%_]/g, '\\$&') + '%' };
    if (queryDto.status !== undefined) where.status = queryDto.status;
    if (queryDto.keyword) {
      const pattern = '%' + queryDto.keyword.replace(/[\\%_]/g, '\\$&') + '%';
      (where as Record<symbol, unknown>)[Op.or] = [{ name: { [Op.like]: pattern } }, { domains: { [Op.like]: pattern } }];
    }
    const { count, rows } = await this.systemSiteRepository.findAndCountAll({
      where,
      offset: (queryDto.page - 1) * queryDto.pageSize,
      limit: queryDto.pageSize,
      order: [
        ['orderNum', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
    return { list: rows.map((site) => this.siteResponse(site)), total: count, page: queryDto.page, pageSize: queryDto.pageSize };
  }

  /** 下拉/站点切换使用：返回全部站点（含禁用），按排序值升序。 */
  async all() {
    const rows = await this.systemSiteRepository.findAll({
      order: [
        ['orderNum', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
    return rows.map((site) => this.siteResponse(site));
  }

  @Transaction()
  async save(id: string | undefined, payload: SystemSiteSaveDto | SystemSiteUpdateDto) {
    this.validateSavePayload(payload);
    let entity: SystemSite | null = null;
    if (id) {
      entity = await this.systemSiteRepository.findByPk(id);
      if (!entity) this.badRequest('没有对应的站点');
    }
    const data = { ...payload } as Record<string, unknown>;
    if (payload.domains !== undefined) data.domains = this.domainsToString(payload.domains);
    if (payload.basePath !== undefined) data.basePath = normalizeBasePath(payload.basePath);
    if (!entity) {
      const created = await this.systemSiteRepository.create({ name: '', basePath: '', remark: '', orderNum: 0, status: 1, domains: '[]', ...data } as never);
      return this.siteResponse(created);
    }
    Object.assign(entity, data);
    return this.siteResponse(await entity.save());
  }

  @Transaction()
  async remove(id: string) {
    const entity = await this.systemSiteRepository.findByPk(id);
    if (!entity) this.badRequest('没有对应的站点');
    await this.systemRewriteRepository.destroy({ where: { siteId: id } });
    await entity.destroy();
  }

  /**
   * 按 Host 解析启用站点。域名精确匹配优先于通配；多个站点命中时按 orderNum、创建时间取第一个。
   */
  async resolveByHost(host: string): Promise<SiteConfig | null> {
    const normalizedHost = normalizeHost(host);
    if (!normalizedHost) return null;
    const sites = await this.systemSiteRepository.findAll({
      where: { status: 1 },
      order: [
        ['orderNum', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
    const site = sites.find((item) => this.parseDomains(item.domains).some((domain) => this.matchDomain(normalizedHost, domain)));
    if (!site) return null;
    const rules = await this.systemRewriteRepository.findAll({
      where: { siteId: site.id, status: 1 },
      order: [
        ['orderNum', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
    // 编译成 Vue Router 可用的 alias 模板，并按 nginx 优先级排序；
    // 无法编译的规则直接跳过，避免把非法 pattern 注入到前端路由。
    const compiled = compileRewriteRules(rules.map((rule) => ({ pattern: rule.pattern, target: rule.target, orderNum: rule.orderNum })));
    return {
      id: site.id,
      name: site.name,
      basePath: normalizeBasePath(site.basePath),
      rules: compiled.rules,
    };
  }

  private matchDomain(host: string, domain: string): boolean {
    if (!domain) return false;
    if (domain.startsWith('*.')) {
      const suffix = domain.slice(1);
      return host.endsWith(suffix) && host !== domain.slice(2);
    }
    return host === domain;
  }
}
