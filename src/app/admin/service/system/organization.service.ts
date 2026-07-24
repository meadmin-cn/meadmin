import { InjectRepository, Transaction } from '@/decorators/index.js';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { InferAttributes, Op, WhereOperators } from '@sequelize/core';
import { WhereAttributeHash } from '@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/where-sql-builder-types.js';
import { SystemAdmin } from '../../../../entities/systemAdmin.entity.js';
import { SystemOrganization } from '../../../../entities/systemOrganization.entity.js';
import { SystemOrganizationCreateDto } from '../../dto/system/organizationCreate.dto.js';
import { SystemOrganizationQueryDto } from '../../dto/system/organizationQuery.dto.js';
import { SystemOrganizationUpdateDto } from '../../dto/system/organizationUpdate.dto.js';

//组织
@Provide()
export class SystemOrganizationService {
  @InjectRepository(SystemOrganization)
  systemOrganizationRepository: typeof SystemOrganization;

  @Inject()
  i18nService: MidwayI18nService;

  //查询belongsToMany关联模型admins管理员
  @InjectRepository(SystemAdmin)
  systemAdminRepository: typeof SystemAdmin;

  /**
   * 获取管理员信息
   * @param queryDto
   * @returns
   */
  @Transaction()
  async getSystemAdmin(page: number, pageSize: number, id: string, username: string = '') {
    const where = {} as WhereAttributeHash<InferAttributes<SystemAdmin, { omit: never }>>;
    if (id) {
      where['id'] = id;
    }
    if (username) {
      where['username'] = { [Op.like]: '%' + username + '%' };
    }
    const { count, rows } = await this.systemAdminRepository.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });
    return {
      list: rows,
      total: count,
      page: page,
      pageSize: pageSize,
    };
  }

  /**
   * 创建数据
   * @param createDto
   * @returns
   */
  @Transaction()
  async create(createDto: SystemOrganizationCreateDto) {
    const entity = await this.systemOrganizationRepository.create(createDto);

    if (createDto.admins) {
      //关联模型用主键进行设置，用对象设置时必须确保对象为模型model的实例
      await entity.setAdmins(createDto.admins.map((v) => v.id));
    }

    return entity;
  }

  /**
   * 列表分页查询
   * @param queryDto 查询条件
   * @returns
   */
  @Transaction()
  async list(queryDto: SystemOrganizationQueryDto) {
    const where = {} as WhereAttributeHash<InferAttributes<SystemOrganization, { omit: never }>>;
    (Object.keys(queryDto) as Array<keyof SystemOrganizationQueryDto>).forEach((key) => {
      if ('page' === key || 'pageSize' === key) {
        return;
      }
      if (null === queryDto[key] || undefined === queryDto[key] || '' === queryDto[key]) {
        return;
      }
      if (key === 'startCreatedAt') {
        where['createdAt'] = (where['createdAt'] ?? {}) as WhereOperators<NonNullable<SystemOrganization['createdAt']>>;
        where['createdAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endCreatedAt') {
        where['createdAt'] = (where['createdAt'] ?? {}) as WhereOperators<NonNullable<SystemOrganization['createdAt']>>;
        where['createdAt'][Op.lte] = queryDto[key];
        return;
      }
      if (key === 'startUpdatedAt') {
        where['updatedAt'] = (where['updatedAt'] ?? {}) as WhereOperators<NonNullable<SystemOrganization['updatedAt']>>;
        where['updatedAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endUpdatedAt') {
        where['updatedAt'] = (where['updatedAt'] ?? {}) as WhereOperators<NonNullable<SystemOrganization['updatedAt']>>;
        where['updatedAt'][Op.lte] = queryDto[key];
        return;
      }
      (where as Record<keyof typeof where, any>)[key] = queryDto[key]; //因为 where[key as Exclude<typeof key,'page'|'pageSize'>] = queryDto[key]; 赋值会触发 TS2590: Expression produces a union type that is too complex to represent.
    });
    const { count, rows } = await this.systemOrganizationRepository.findAndCountAll({
      where,
      offset: (queryDto.page - 1) * queryDto.pageSize,
      limit: queryDto.pageSize,
      include: ['createdAdmin', 'updatedAdmin', 'admins'],
      order: [['createdAt', 'DESC']],
    });
    return {
      list: rows,
      total: count,
      page: queryDto.page,
      pageSize: queryDto.pageSize,
    };
  }

  /**
   * 根据主键获取一条信息
   * @param id 主键
   * @returns
   */
  @Transaction()
  async findOne(id: string) {
    const entity = await this.systemOrganizationRepository.findByPk(id, { include: ['createdAdmin', 'updatedAdmin', 'admins'] });
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    return entity;
  }

  /**
   * 更新数据
   * @param id 主键
   * @param updateDto 数据对象
   * @returns
   */
  @Transaction()
  async update(id: string, updateDto: SystemOrganizationUpdateDto) {
    const entity = await this.systemOrganizationRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    Object.assign(entity, updateDto);

    if (updateDto.admins) {
      //关联模型用主键进行设置，用对象设置时必须确保对象为模型model的实例
      await entity.setAdmins(updateDto.admins.map((v) => v.id));
    }

    return await entity.save();
  }

  /**
   * 删除数据
   * @param id 主键
   * @returns
   */
  @Transaction()
  async remove(id: string) {
    const entity = await this.systemOrganizationRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    await entity.destroy();
  }
}
