import { InjectRepository, Transaction } from '@/decorators/index.js';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { SystemConfig, SystemConfigOption } from '../../../entities/systemConfig.entity.js';
import { SystemConfigGroup } from '../../../entities/systemConfigGroup.entity.js';

type ConfigValue = string | number | unknown[] | Record<string, unknown> | null;

@Provide()
export class ConfigService {
  @InjectRepository(SystemConfigGroup)
  systemConfigGroupRepository: typeof SystemConfigGroup;

  @InjectRepository(SystemConfig)
  systemConfigRepository: typeof SystemConfig;

  @Inject()
  i18nService: MidwayI18nService;

  private badRequest(message: string): never {
    throw new BadRequestError(this.i18nService.translate(message));
  }

  private normalizeOptions(options: unknown): SystemConfigOption[] {
    if (!Array.isArray(options)) this.badRequest('options 必须是数组');
    const result = options.map((option, index) => {
      if (!this.isPlainObject(option)) this.badRequest(`options[${index}] 必须是对象`);
      const item = option;
      // 兼容历史字典选项中的 disabled 字段，并统一转换为 status。
      const keys = Object.keys(item);
      const allowedKeys = new Set(['value', 'label', 'sort', 'status', 'disabled']);
      if (keys.some((key) => !allowedKeys.has(key)) || !keys.includes('value') || !keys.includes('label')) this.badRequest(`options[${index}] 只允许包含 value、label、sort、status`);
      if (item.status === undefined && item.disabled !== undefined) item.status = item.disabled ? 0 : 1;
      if (item.sort === undefined) item.sort = index + 1;
      if (item.status === undefined) item.status = 1;
      if ((typeof item.value !== 'string' && typeof item.value !== 'number') || (typeof item.value === 'number' && !Number.isFinite(item.value))) {
        this.badRequest(`options[${index}].value 必须是字符串或有限数字`);
      }
      if (typeof item.label !== 'string' || item.label.length === 0 || item.label.length > 100) this.badRequest(`options[${index}].label 必须是 1-100 个字符`);
      if (!Number.isInteger(item.sort) || (item.sort as number) < 0) this.badRequest(`options[${index}].sort 必须是非负整数`);
      if (item.status !== 0 && item.status !== 1) this.badRequest(`options[${index}].status 必须是 0 或 1`);
      return { value: item.value, label: item.label, sort: item.sort as number, status: item.status as number };
    });
    const values = new Set(result.map((item) => String(item.value)));
    if (values.size !== result.length) this.badRequest('options.value 不能重复');
    return result.sort((left, right) => left.sort - right.sort);
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  private parseStoredValue(config: SystemConfig): ConfigValue | null {
    if (config.value === null) return null;
    if (['string', 'textarea', 'multiline', 'text'].includes(config.variableType)) {
      // 兼容历史数据：字符串可能曾按 JSON 字符串序列化，返回前去除外层引号。
      if (config.variableType === 'string') {
        try {
          const parsed = JSON.parse(config.value);
          if (typeof parsed === 'string') return parsed;
        } catch {
          // 普通字符串无需解析。
        }
      }
      return config.value;
    }
    try {
      return JSON.parse(config.value) as ConfigValue;
    } catch {
      this.badRequest(`配置 ${config.variableCode} 的存储值格式错误`);
    }
  }

  private configResponse(config: SystemConfig) {
    const result: Record<string, unknown> = {
      id: config.id,
      variableCode: config.variableCode,
      variableType: config.variableType,
      variableTitle: config.variableTitle,
      sortOrder: config.sortOrder,
      isRequired: config.isRequired,
      status: config.status,
      description: config.description,
      value: this.parseStoredValue(config),
      options: config.options?.length ? this.normalizeOptions(config.options) : [],
    };
    if (config.variableType !== 'dict' && !config.options?.length) delete result.options;
    return result;
  }

  @Transaction()
  async getValues(groupCode: string) {
    const group = await this.systemConfigGroupRepository.findOne({ where: { groupCode, status: 1 } });
    if (!group) this.badRequest('没有对应的启用配置分组');
    const configs = await this.systemConfigRepository.findAll({
      where: { groupId: group.id, status: 1 },
      order: [
        ['sortOrder', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
    return configs.map((config) => this.configResponse(config));
  }

  /**
   * 根据字段返参和path获取对应value
   * @param values
   * @param path
   */
  valuesToValue(values: Record<string, unknown>[], path: string) {
    const result = values.reduce<Record<string, unknown>>((target, item) => {
      target[String(item.variableCode)] = item.value;
      return target;
    }, {});
    return path
      .split('.')
      .filter(Boolean)
      .reduce<unknown>((value, key) => (value && typeof value === 'object' && Object.hasOwn(value, key) ? (value as Record<string, unknown>)[key] : undefined), result);
  }

  @Transaction()
  async getDict(code: string) {
    const config = await this.systemConfigRepository.findOne({
      where: { variableCode: code, status: 1 },
      include: [{ association: 'group', where: { status: 1 } }],
    });
    if (!config || (config.variableType !== 'dict' && config.group?.groupType !== 'dict')) this.badRequest('没有对应的启用字典');
    return this.normalizeOptions(config.options)
      .filter((option) => option.status === 1)
      .sort((left, right) => left.sort - right.sort)
      .map(({ value, label }) => ({ value, label }));
  }
}
