import { InjectRepository, Transaction } from '@/decorators/index.js';
import { SystemMenu } from '@/entities/systemMenu.entity.js';
import { NormalWhereOptions } from '@meadmin/core/types/entity';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { Includeable, InferAttributes, Op, WhereOperators } from '@sequelize/core';
import { SystemAdmin } from '../../../../entities/systemAdmin.entity.js';
import { AdminProfileUpdateDto } from '../../dto/profileUpdate.dto.js';
import { SystemAdminCreateDto } from '../../dto/system/adminCreate.dto.js';
import { SystemAdminQueryDto } from '../../dto/system/adminQuery.dto.js';
import { SystemAdminUpdateDto } from '../../dto/system/adminUpdate.dto.js';
import { LoginService } from '../login.serveice.js';

//管理员
@Provide()
export class SystemAdminService {
  @InjectRepository(SystemAdmin)
  SystemAdminRepository: typeof SystemAdmin;

  @Inject()
  i18nService: MidwayI18nService;

  @Inject()
  loginService: LoginService;

  /**
   * 创建数据
   * @param createDto
   * @returns
   */
  async create(createDto: SystemAdminCreateDto) {
    if (createDto.password) {
      Object.assign(createDto, this.loginService.entityPassword(createDto.password));
    }
    const entity = this.SystemAdminRepository.build(createDto);

    await entity.save();
    if (createDto.roleIds) {
      await entity.setRoles(createDto.roleIds);
    }
    if (createDto.orgIds) {
      await entity.setOrganizations(createDto.orgIds);
    }
    if (createDto.avatar) {
      await entity.setAvatar(createDto.avatar.id);
    }
    return entity;
  }

  /**
   * 列表分页查询
   * @param queryDto 查询条件
   * @returns
   */
  async list(queryDto: SystemAdminQueryDto) {
    const where = {} as NormalWhereOptions<InferAttributes<SystemAdmin>>;
    const benlongWhere = [] as Array<Includeable>;
    (Object.keys(queryDto) as Array<keyof SystemAdminQueryDto>).forEach((key) => {
      if ('page' === key || 'pageSize' === key) {
        return;
      }
      if (null === queryDto[key] || undefined === queryDto[key] || '' === queryDto[key]) {
        return;
      }

      if (key === 'startLastLoginAt') {
        where['lastLoginAt'] = (where['lastLoginAt'] ?? {}) as WhereOperators<NonNullable<SystemAdmin['lastLoginAt']>>;
        where['lastLoginAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endLastLoginAt') {
        where['lastLoginAt'] = (where['lastLoginAt'] ?? {}) as WhereOperators<NonNullable<SystemAdmin['lastLoginAt']>>;
        where['lastLoginAt'][Op.lte] = queryDto[key];
        return;
      }
      if (key === 'startCreatedAt') {
        where['createdAt'] = (where['createdAt'] ?? {}) as WhereOperators<SystemAdmin['createdAt']>;
        where['createdAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endCreatedAt') {
        where['createdAt'] = (where['createdAt'] ?? {}) as WhereOperators<SystemAdmin['createdAt']>;
        where['createdAt'][Op.lte] = queryDto[key];
        return;
      }
      if (key === 'startUpdatedAt') {
        where['updatedAt'] = (where['updatedAt'] ?? {}) as WhereOperators<SystemAdmin['updatedAt']>;
        where['updatedAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endUpdatedAt') {
        where['updatedAt'] = (where['updatedAt'] ?? {}) as WhereOperators<SystemAdmin['updatedAt']>;
        where['updatedAt'][Op.lte] = queryDto[key];
        return;
      }
      if ((['username', 'nickname', 'mobile'] as const).includes(key)) {
        (where as Record<keyof typeof where, any>)[key as 'username' | 'nickname' | 'mobile'] = { [Op.like]: `%${queryDto[key] as string}%` };
        return;
      }
      if (key === 'query') {
        where[Op.or] = [{ username: { [Op.like]: `%${queryDto[key]}%` } }, { nickname: { [Op.like]: `%${queryDto[key]}%` } }, { mobile: { [Op.like]: `%${queryDto[key]}%` } }];
        return;
      }
      if (key === 'roleIds') {
        if (queryDto[key]?.length) {
          benlongWhere.push({
            association: 'roles',
            as: 'rolesWhere',
            attributes: [],
            required: true,
            where: { id: { [Op.in]: queryDto[key] } },
          });
        }
        return;
      }
      if (key === 'orgIds') {
        if (queryDto[key]?.length) {
          benlongWhere.push({
            association: 'organizations',
            as: 'organizationsWhere',
            attributes: [],
            required: true,
            where: { id: { [Op.in]: queryDto[key] } },
          });
        }
        return;
      }
      (where as Record<keyof typeof where, any>)[key as any] = queryDto[key]; //where[key as Exclude<typeof key,'page'|'pageSize'>] = queryDto[key]; 赋值会触发 TS2590: Expression produces a union type that is too complex to represent.
    });
    const { count, rows } = await this.SystemAdminRepository.findAndCountAll({
      where,
      offset: (queryDto.page - 1) * queryDto.pageSize,
      limit: queryDto.pageSize,
      order: [['createdAt', 'DESC']],
      include: [
        'createdAdmin',
        'updatedAdmin',
        {
          association: 'roles',
          where: { status: 1 },
          required: false,
          include: [
            {
              model: SystemMenu,
              required: false,
            },
          ],
        },
        {
          association: 'avatar',
          attributes: { exclude: [] }, //必须设置attributes，否则file的附件属性 url属性返回给前端时没有，已提交[BUG反馈](https://github.com/sequelize/sequelize/issues/18059)
        },
        {
          association: 'organizations',
          required: false,
        },
        ...benlongWhere,
      ],
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
  async findOne(id: string) {
    const entity = await this.SystemAdminRepository.findByPk(id, {
      include: [
        'createdAdmin',
        'updatedAdmin',
        {
          association: 'roles',
          required: false,
          include: [
            {
              model: SystemMenu,
              where: { status: 1 },
              required: false,
            },
          ],
        },
        {
          association: 'organizations',
          required: false,
        },
        {
          association: 'avatar',
          attributes: { exclude: [] }, //必须设置attributes，否则file的附件属性 url属性返回给前端时没有，已提交[BUG反馈](https://github.com/sequelize/sequelize/issues/18059)
        },
      ],
    });
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
  /** 个人中心仅返回展示字段，不暴露密码、盐及角色菜单等内部数据。 */
  async findProfile(id: string): Promise<Record<string, unknown>> {
    const entity = await this.findOne(id);
    return {
      id: entity.id,
      username: entity.username,
      nickname: entity.nickname,
      mobile: entity.mobile,
      email: entity.email,
      status: entity.status,
      avatar: entity.avatar ?? null,
      roles: entity.roles?.map((role) => ({ id: role.id, roleName: role.roleName })) ?? [],
      organizations: entity.organizations?.map((org) => ({ id: org.id, orgName: org.orgName })) ?? [],
    };
  }

  /** 个人资料只允许更新白名单字段，不复用管理员管理的授权字段。 */
  @Transaction()
  async updateProfile(id: string, updateDto: AdminProfileUpdateDto): Promise<Record<string, unknown>> {
    const entity = await this.SystemAdminRepository.findByPk(id);
    if (!entity) throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    const { oldPassword, newPassword, avatar } = updateDto;
    if (newPassword) {
      if (!oldPassword || !this.loginService.checkPassword(oldPassword, entity.salt, entity.password)) {
        throw new BadRequestError(this.i18nService.translate('原始密码错误'));
      }
      Object.assign(entity, this.loginService.entityPassword(newPassword));
    }
    entity.nickname = updateDto.nickname;
    entity.mobile = updateDto.mobile;
    if (updateDto.email !== undefined) entity.email = updateDto.email;
    if (avatar !== undefined) entity.set('avatarFileId', avatar?.id ?? '');
    await entity.save();
    return await this.findProfile(id);
  }

  async update(id: string, updateDto: SystemAdminUpdateDto) {
    const entity = await this.SystemAdminRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    const password = entity.password;
    const salf = entity.salt;
    Object.assign(entity, updateDto);
    if (updateDto.password) {
      Object.assign(entity, this.loginService.entityPassword(updateDto.password));
    } else {
      entity.password = password;
      entity.salt = salf;
    }
    if (updateDto.roleIds) {
      await entity.setRoles(updateDto.roleIds);
    }
    if (updateDto.orgIds) {
      await entity.setOrganizations(updateDto.orgIds);
    }
    if (updateDto.avatar !== undefined) {
      //关联模型用主键进行设置，用对象设置时必须确保对象为模型model的实例
      await entity.setAvatar(updateDto.avatar?.id ?? null);
    }
    return await entity.save();
  }

  /**
   * 删除数据
   * @param id 主键
   * @returns
   */
  async remove(id: string) {
    const entity = await this.SystemAdminRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    await entity.destroy();
  }
}
