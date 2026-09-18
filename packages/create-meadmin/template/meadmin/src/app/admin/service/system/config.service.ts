import { InjectRepository, Transaction } from '@/decorators/index.js';
import { NormalWhereOptions } from '@meadmin/core/types/entity';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { InferAttributes, Op } from '@sequelize/core';
import { SystemConfig, SystemConfigOption, SystemConfigVariableType } from '../../../../entities/systemConfig.entity.js';
import { SystemConfigGroup } from '../../../../entities/systemConfigGroup.entity.js';
import { SystemConfigCreateDto } from '../../dto/system/configCreate.dto.js';
import { SystemConfigGroupCreateDto } from '../../dto/system/configGroupCreate.dto.js';
import { SystemConfigGroupQueryDto } from '../../dto/system/configGroupQuery.dto.js';
import { SystemConfigGroupSortDto } from '../../dto/system/configGroupSort.dto.js';
import { SystemConfigGroupUpdateDto } from '../../dto/system/configGroupUpdate.dto.js';
import { SystemConfigQueryDto } from '../../dto/system/configQuery.dto.js';
import { SystemConfigUpdateDto } from '../../dto/system/configUpdate.dto.js';
import { SystemConfigValueSaveDto } from '../../dto/system/configValue.dto.js';

const BUILTIN_GROUP_CODES = new Set(['base', 'dict']);
const CONFIG_NAME_PATTERN = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
const DICT_CODE_PATTERN = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*_[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
const VARIABLE_TYPES: SystemConfigVariableType[] = ['string', 'number', 'textarea', 'multiline', 'text', 'array', 'keyvalue', 'dict'];
const METADATA_FIELDS = ['variableTitle', 'sortOrder', 'isRequired', 'status', 'description'] as const;

type ConfigValue = string | number | unknown[] | Record<string, unknown> | null;

@Provide()
export class SystemConfigService {
  @InjectRepository(SystemConfigGroup)
  systemConfigGroupRepository: typeof SystemConfigGroup;

  @InjectRepository(SystemConfig)
  systemConfigRepository: typeof SystemConfig;

  @Inject()
  i18nService: MidwayI18nService;

  private badRequest(message: string): never {
    throw new BadRequestError(this.i18nService.translate(message));
  }

  private ensureName(value: string, field: string) {
    if (!CONFIG_NAME_PATTERN.test(value)) this.badRequest(`${field}格式错误，只能包含小写字母、数字、下划线，且必须以字母开头`);
  }

  private validateDictCode(groupType: string, variableCode: string) {
    if (groupType === 'dict' && !DICT_CODE_PATTERN.test(variableCode)) {
      this.badRequest('字典配置 code 必须使用表名_字段名格式，且仅允许小写字母、数字和下划线');
    }
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

  private validateValue(variableType: SystemConfigVariableType, value: unknown, variableCode: string): ConfigValue {
    if (['string', 'textarea', 'multiline', 'text'].includes(variableType)) {
      if (typeof value !== 'string') this.badRequest(`${variableCode} 的值必须是字符串`);
      return value;
    }
    if (variableType === 'number') {
      if (value === null) return null;
      if ((typeof value !== 'number' && typeof value !== 'string') || value === '' || !Number.isFinite(Number(value))) {
        this.badRequest(`${variableCode} 的值必须是有限数字或 null`);
      }
      return Number(value);
    }
    if (variableType === 'array') {
      if (!Array.isArray(value) || value.some((item) => !['string', 'number'].includes(typeof item) || (typeof item === 'number' && !Number.isFinite(item)))) {
        this.badRequest(`${variableCode} 的值必须是字符串或数字数组`);
      }
      return value;
    }
    if (!this.isPlainObject(value)) this.badRequest(`${variableCode} 的值必须是对象`);
    if (Object.entries(value).some(([key, item]) => !key || typeof item === 'object' || !['string', 'number', 'boolean'].includes(typeof item))) {
      this.badRequest(`${variableCode} 的值必须是键和值均有效的对象`);
    }
    return value;
  }

  private serializeValue(config: SystemConfig, value: unknown, variableCode = config.variableCode): string | null {
    const normalized = this.validateValue(config.variableType, value, variableCode);
    if (normalized === null) return null;
    if (typeof normalized === 'string') return normalized;
    return JSON.stringify(normalized);
  }

  private defaultValue(variableType: SystemConfigVariableType): ConfigValue {
    if (['string', 'textarea', 'multiline', 'text'].includes(variableType)) return '';
    if (variableType === 'number') return null;
    if (variableType === 'array') return [];
    return {};
  }

  private validateConfigPayload(payload: Partial<SystemConfig>, groupType: string) {
    if (payload.variableCode !== undefined) this.ensureName(payload.variableCode, '变量名');
    if (payload.variableType !== undefined && !VARIABLE_TYPES.includes(payload.variableType)) this.badRequest('变量类型不受支持');
    // 字典类型仅允许出现在字典配置组，其他配置组不得创建字典字段。
    if (payload.variableType === 'dict' && groupType !== 'dict') this.badRequest('字典类型只能用于字典配置组');
    if (payload.sortOrder !== undefined && (!Number.isInteger(payload.sortOrder) || payload.sortOrder < 0)) this.badRequest('配置项排序值必须是非负整数');
    if (payload.isRequired !== undefined && typeof payload.isRequired !== 'boolean') this.badRequest('isRequired 必须是布尔值');
    if (payload.status !== undefined && payload.status !== 0 && payload.status !== 1) this.badRequest('配置项 status 必须是 0 或 1');
    if (payload.description !== undefined && typeof payload.description !== 'string') this.badRequest('配置项 description 必须是字符串');
    if (payload.options !== undefined) this.normalizeOptions(payload.options);
    if (payload.value !== undefined && payload.variableType !== undefined) this.validateValue(payload.variableType, payload.value, payload.variableCode ?? '配置项');
  }

  @Transaction()
  async listGroups(queryDto: SystemConfigGroupQueryDto) {
    await this.seedBuiltin();
    const where = {} as NormalWhereOptions<InferAttributes<SystemConfigGroup>>;
    (Object.keys(queryDto) as Array<keyof SystemConfigGroupQueryDto>).forEach((key) => {
      if (key === 'page' || key === 'pageSize' || queryDto[key] === undefined || queryDto[key] === null || queryDto[key] === '') return;
      (where as Record<string, unknown>)[key] = queryDto[key];
    });
    const { count, rows } = await this.systemConfigGroupRepository.findAndCountAll({
      where,
      offset: (queryDto.page - 1) * queryDto.pageSize,
      limit: queryDto.pageSize,
      order: [
        ['isBuiltin', 'DESC'],
        ['sortOrder', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
    return { list: rows, total: count, page: queryDto.page, pageSize: queryDto.pageSize };
  }

  @Transaction()
  async findGroup(id: string) {
    const entity = await this.systemConfigGroupRepository.findByPk(id, {
      include: [
        {
          association: 'configs',
          order: [
            ['sortOrder', 'ASC'],
            ['createdAt', 'ASC'],
          ],
        },
      ],
    });
    if (!entity) this.badRequest('没有对应的配置分组');
    return entity;
  }

  @Transaction()
  async createGroup(createDto: SystemConfigGroupCreateDto) {
    this.ensureName(createDto.groupCode, '分组编码');
    if (BUILTIN_GROUP_CODES.has(createDto.groupCode)) this.badRequest('base 和 dict 为内置分组编码，不允许使用');
    if (createDto.sortOrder !== undefined && (!Number.isInteger(createDto.sortOrder) || createDto.sortOrder < 0)) this.badRequest('分组排序值必须是非负整数');
    const maxSortOrder = Number((await this.systemConfigGroupRepository.max('sortOrder', { where: { isBuiltin: false } })) || 99);
    const sortOrder = createDto.sortOrder ?? maxSortOrder + 1;
    return await this.systemConfigGroupRepository.create({ ...createDto, sortOrder, groupType: 'custom', isBuiltin: false });
  }

  @Transaction()
  async updateGroup(id: string, updateDto: SystemConfigGroupUpdateDto) {
    const entity = await this.systemConfigGroupRepository.findByPk(id);
    if (!entity) this.badRequest('没有对应的配置分组');
    if (entity.isBuiltin) {
      if (updateDto.groupCode !== undefined || updateDto.sortOrder !== undefined) this.badRequest('内置配置分组仅允许修改名称、说明和状态');
      Object.assign(entity, { groupName: updateDto.groupName, description: updateDto.description, status: updateDto.status });
      return await entity.save();
    }
    if (updateDto.groupCode !== undefined) {
      this.ensureName(updateDto.groupCode, '分组编码');
      if (BUILTIN_GROUP_CODES.has(updateDto.groupCode)) this.badRequest('base 和 dict 为内置分组编码，不允许使用');
    }
    if (updateDto.sortOrder !== undefined && (!Number.isInteger(updateDto.sortOrder) || updateDto.sortOrder < 0)) this.badRequest('分组排序值必须是非负整数');
    if (updateDto.status !== undefined && updateDto.status !== 0 && updateDto.status !== 1) this.badRequest('分组 status 必须是 0 或 1');
    Object.assign(entity, updateDto);
    return await entity.save();
  }

  @Transaction()
  async sortGroups(sortDto: SystemConfigGroupSortDto) {
    if (sortDto.groupId === sortDto.targetGroupId) this.badRequest('不能将配置组移动到自身');
    const [group, target] = await Promise.all([this.systemConfigGroupRepository.findByPk(sortDto.groupId), this.systemConfigGroupRepository.findByPk(sortDto.targetGroupId)]);
    if (!group || !target) this.badRequest('没有对应的配置分组');
    if (group.isBuiltin || target.isBuiltin || group.groupType !== 'custom' || target.groupType !== 'custom') this.badRequest('只能调整自定义配置组顺序');
    const groups = await this.systemConfigGroupRepository.findAll({
      where: { isBuiltin: false, groupType: 'custom' },
      order: [
        ['sortOrder', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
    const ordered = groups.filter((item) => item.id !== group.id);
    const targetIndex = ordered.findIndex((item) => item.id === target.id);
    ordered.splice(targetIndex, 0, group);
    for (const [index, item] of ordered.entries()) {
      item.sortOrder = 100 + index;
      await item.save();
    }
    return group;
  }

  @Transaction()
  async removeGroup(id: string) {
    const entity = await this.systemConfigGroupRepository.findByPk(id);
    if (!entity) this.badRequest('没有对应的配置分组');
    if (entity.isBuiltin) this.badRequest('内置配置分组不可删除');
    await this.systemConfigRepository.destroy({ where: { groupId: id } });
    await entity.destroy();
  }

  @Transaction()
  async listConfigs(queryDto: SystemConfigQueryDto) {
    const where = {} as NormalWhereOptions<InferAttributes<SystemConfig>>;
    (Object.keys(queryDto) as Array<keyof SystemConfigQueryDto>).forEach((key) => {
      if (key === 'keyword') {
        const keyword = queryDto.keyword?.trim();
        if (keyword) {
          const pattern = '%' + keyword.replace(/[\\%_]/g, '\\$&') + '%';
          where[Op.or] = [{ variableCode: { [Op.like]: pattern } }, { variableTitle: { [Op.like]: pattern } }];
        }
        return;
      }
      if ((key === 'variableCode' || key === 'variableTitle') && queryDto[key]) {
        where[key] = { [Op.like]: '%' + queryDto[key].replace(/[\\%_]/g, '\\$&') + '%' };
        return;
      }
      if (key === 'page' || key === 'pageSize' || queryDto[key] === undefined || queryDto[key] === null || queryDto[key] === '') return;
      (where as Record<string, unknown>)[key] = queryDto[key];
    });
    const { count, rows } = await this.systemConfigRepository.findAndCountAll({
      where,
      include: ['group'],
      offset: (queryDto.page - 1) * queryDto.pageSize,
      limit: queryDto.pageSize,
      order: [
        ['isBuiltin', 'DESC'],
        ['sortOrder', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
    return { list: rows, total: count, page: queryDto.page, pageSize: queryDto.pageSize };
  }

  @Transaction()
  async findConfig(id: string) {
    const entity = await this.systemConfigRepository.findByPk(id, { include: ['group'] });
    if (!entity) this.badRequest('没有对应的配置项');
    return entity;
  }

  @Transaction()
  async createConfig(createDto: SystemConfigCreateDto) {
    const group = await this.systemConfigGroupRepository.findByPk(createDto.groupId);
    if (!group) this.badRequest('没有对应的配置分组');
    if (group.groupType !== 'dict' && group.isBuiltin) this.badRequest('内置配置分组不可新增配置项');
    this.validateConfigPayload(createDto, group.groupType);
    this.validateDictCode(group.groupType, createDto.variableCode);
    // 变量标识只需在当前配置组内唯一，不同配置组允许复用。
    const duplicate = await this.systemConfigRepository.findOne({ where: { groupId: createDto.groupId, variableCode: createDto.variableCode } });
    if (duplicate) this.badRequest('当前配置组中已存在相同的变量标识');
    const defaultValue = this.defaultValue(createDto.variableType);
    const value = createDto.value === undefined ? (defaultValue === null || typeof defaultValue === 'string' ? defaultValue : JSON.stringify(defaultValue)) : this.serializeValue(createDto as SystemConfig, createDto.value);
    const options = createDto.options === undefined ? [] : this.normalizeOptions(createDto.options);
    return await this.systemConfigRepository.create({ ...createDto, value, options, isBuiltin: false });
  }

  @Transaction()
  async updateConfig(id: string, updateDto: SystemConfigUpdateDto) {
    const entity = await this.systemConfigRepository.findByPk(id, { include: ['group'] });
    if (!entity) this.badRequest('没有对应的配置项');
    const group = entity.group;
    if (!group) this.badRequest('没有对应的配置分组');
    if (entity.isBuiltin) {
      const invalidField = Object.keys(updateDto).find((field) => field !== 'value' && field !== 'options' && !METADATA_FIELDS.includes(field as (typeof METADATA_FIELDS)[number]));
      if (invalidField) this.badRequest('内置配置项只能修改配置值、选项和元数据');
      this.validateConfigPayload({ ...entity, ...updateDto }, group.groupType);
      if (updateDto.value !== undefined) entity.value = this.serializeValue(entity, updateDto.value);
      if (updateDto.options !== undefined) entity.options = this.normalizeOptions(updateDto.options);
      for (const field of METADATA_FIELDS) {
        if (updateDto[field] !== undefined) entity[field] = updateDto[field] as never;
      }
      return await entity.save();
    }
    const targetGroup = updateDto.groupId && updateDto.groupId !== entity.groupId ? await this.systemConfigGroupRepository.findByPk(updateDto.groupId) : group;
    if (updateDto.variableCode !== undefined || updateDto.groupId !== undefined) {
      const duplicate = await this.systemConfigRepository.findOne({ where: { groupId: targetGroup?.id ?? entity.groupId, variableCode: updateDto.variableCode ?? entity.variableCode } });
      if (duplicate && duplicate.id !== entity.id) this.badRequest('当前配置组中已存在相同的变量标识');
    }
    if (!targetGroup) this.badRequest('没有对应的配置分组');
    if (targetGroup.isBuiltin) this.badRequest('配置项不能移动到内置配置分组');
    this.validateConfigPayload({ ...entity, ...updateDto }, targetGroup.groupType);
    this.validateDictCode(targetGroup.groupType, updateDto.variableCode ?? entity.variableCode);
    const payload = { ...updateDto } as Record<string, unknown>;
    if (updateDto.value !== undefined) payload.value = this.serializeValue({ ...entity, ...updateDto } as SystemConfig, updateDto.value);
    if (updateDto.options !== undefined) payload.options = this.normalizeOptions(updateDto.options);
    Object.assign(entity, payload);
    return await entity.save();
  }

  @Transaction()
  async removeConfig(id: string) {
    const entity = await this.systemConfigRepository.findByPk(id);
    if (!entity) this.badRequest('没有对应的配置项');
    // 所有内置字典都不可删除，避免系统基础字典被业务误删。
    if (entity.isBuiltin) this.badRequest('内置配置项不可删除');
    await entity.destroy();
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
  async listDictConfigs(queryDto: SystemConfigQueryDto) {
    const group = await this.systemConfigGroupRepository.findOne({ where: { groupCode: 'dict', status: 1 } });
    if (!group) this.badRequest('没有对应的启用字典配置组');
    const where = { groupId: group.id, variableType: 'dict' } as NormalWhereOptions<InferAttributes<SystemConfig>>;
    if (queryDto.variableCode) where.variableCode = queryDto.variableCode;
    if (queryDto.variableTitle) where.variableTitle = queryDto.variableTitle;
    const { count, rows } = await this.systemConfigRepository.findAndCountAll({
      where,
      offset: (queryDto.page - 1) * queryDto.pageSize,
      limit: queryDto.pageSize,
      order: [
        ['sortOrder', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
    return { list: rows.map((config) => this.configResponse(config)), total: count, page: queryDto.page, pageSize: queryDto.pageSize };
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

  @Transaction()
  async saveValues(groupCode: string, saveDto: SystemConfigValueSaveDto) {
    const group = await this.systemConfigGroupRepository.findOne({ where: { groupCode } });
    if (!group) this.badRequest('没有对应的配置分组');
    const configs = await this.systemConfigRepository.findAll({ where: { groupId: group.id } });
    const configMap = new Map(configs.map((config) => [config.variableCode, config]));
    const names = new Set<string>();
    for (const item of saveDto.values) {
      if (names.has(item.variableCode)) this.badRequest(`变量名 ${item.variableCode} 重复`);
      names.add(item.variableCode);
      const config = configMap.get(item.variableCode);
      if (!config) this.badRequest(`配置项 ${item.variableCode} 不属于当前配置组`);
      config.value = this.serializeValue(config, item.value, item.variableCode);
      if (item.options !== undefined) config.options = this.normalizeOptions(item.options);
      await config.save();
    }
    return saveDto.values.map((item) => this.configResponse(configMap.get(item.variableCode) as SystemConfig));
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

  @Transaction()
  async seedBuiltin() {
    const baseGroup = await this.systemConfigGroupRepository.findOne({ where: { groupCode: 'base' } });
    const dictGroup = await this.systemConfigGroupRepository.findOne({ where: { groupCode: 'dict' } });
    if (!baseGroup || !dictGroup) {
      // 兼容未执行迁移 SQL 的开发环境：至少创建两个配置组，避免后台出现空白配置页。
      const groups = await this.systemConfigGroupRepository.findAll({ order: [['createdAt', 'ASC']] });
      return { baseGroup: baseGroup ?? groups[0], dictGroup: dictGroup ?? groups[1] };
    }
    return { baseGroup, dictGroup };
  }
}
