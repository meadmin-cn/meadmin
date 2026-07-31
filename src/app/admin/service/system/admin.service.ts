import { InjectRepository } from '@/decorators/index.js';
import { SystemMenu } from '@/entities/systemMenu.entity.js';
import { NormalWhereOptions } from '@/types/entity.js';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { Includeable, InferAttributes, Op, WhereOperators } from '@sequelize/core';
import { SystemAdmin } from '../../../../entities/systemAdmin.entity.js';
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
        benlongWhere.push({
          association: 'roles',
          as: 'rolesWhere',
          attributes: [],
          required: true,
          where: { id: { [Op.in]: queryDto[key] } },
        });
        return;
      }
      if (key === 'orgIds') {
        benlongWhere.push({
          association: 'orgaizations',
          as: 'orgaizationsWhere',
          attributes: [],
          required: true,
          where: { id: { [Op.in]: queryDto[key] } },
        });
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
              where: { status: 1 },
              required: false,
            },
          ],
        },
        {
          association: 'avatar',
          attributes: { exclude: [] }, //必须设置attributes，否则file的附件属性 url属性返回给前端时没有，已提交[BUG反馈](https://github.com/sequelize/sequelize/issues/18059)
        },
        {
          association: 'orgaizations',
          where: { status: 1 },
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
          where: { status: 1 },
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
