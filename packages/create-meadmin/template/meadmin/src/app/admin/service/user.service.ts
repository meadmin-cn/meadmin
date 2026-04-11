import { LoginService } from '@/app/index/service/login.serveice.js';
import { InjectRepository, Transaction } from '@/decorators/index.js';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { InferAttributes, Op, WhereOperators } from '@sequelize/core';
import { WhereAttributeHash } from '@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/where-sql-builder-types.js';
import { User } from '../../../entities/user.entity.js';
import { UserFile } from '../../../entities/userFile.entity.js';
import { UserCreateDto } from '../dto/userCreate.dto.js';
import { UserQueryDto } from '../dto/userQuery.dto.js';
import { UserUpdateDto } from '../dto/userUpdate.dto.js';

//用户
@Provide()
export class UserService {
  @InjectRepository(User)
  userRepository: typeof User;

  @Inject()
  i18nService: MidwayI18nService;

  @Inject()
  userLoginService: LoginService;

  //查询belongsTo关联模型avatar用户附件表(前台)
  @InjectRepository(UserFile)
  userFileRepository: typeof UserFile;

  /**
   * 获取用户附件表(前台)信息
   * @param queryDto
   * @returns
   */
  @Transaction()
  async getUserFile(page: number, pageSize: number, id: string, name: string = '') {
    const where = {} as WhereAttributeHash<InferAttributes<UserFile, { omit: never }>>;
    if (id) {
      where['id'] = id;
    }
    if (name) {
      where['name'] = { [Op.like]: '%' + name + '%' };
    }
    const { count, rows } = await this.userFileRepository.findAndCountAll({
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
  async create(createDto: UserCreateDto) {
    const entity = await this.userRepository.create(createDto);

    if (createDto.avatar) {
      //关联模型用主键进行设置，用对象设置时必须确保对象为模型model的实例
      await entity.setAvatar(createDto.avatar.id);
    }

    return entity;
  }

  /**
   * 列表分页查询
   * @param queryDto 查询条件
   * @returns
   */
  @Transaction()
  async list(queryDto: UserQueryDto) {
    const where = {} as WhereAttributeHash<InferAttributes<User, { omit: never }>>;
    (Object.keys(queryDto) as Array<keyof UserQueryDto>).forEach((key) => {
      if ('page' === key || 'pageSize' === key) {
        return;
      }
      if (null === queryDto[key] || undefined === queryDto[key] || '' === queryDto[key]) {
        return;
      }
      if (key === 'startCreatedAt') {
        where['createdAt'] = (where['createdAt'] ?? {}) as WhereOperators<User['createdAt']>;
        where['createdAt'] = { ...where['createdAt'], [Op.gte]: queryDto[key] };
        return;
      }
      if (key === 'endCreatedAt') {
        where['createdAt'] = (where['createdAt'] ?? {}) as WhereOperators<User['createdAt']>;
        where['createdAt'][Op.lte] = queryDto[key];
        return;
      }
      if (key === 'startUpdatedAt') {
        where['updatedAt'] = (where['updatedAt'] ?? {}) as WhereOperators<User['updatedAt']>;
        where['updatedAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endUpdatedAt') {
        where['updatedAt'] = (where['updatedAt'] ?? {}) as WhereOperators<User['updatedAt']>;
        where['updatedAt'][Op.lte] = queryDto[key];
        return;
      }
       if (key === 'startLastLoginAt') {
        where['lastLoginAt'] = (where['lastLoginAt'] ?? {}) as WhereOperators<NonNullable<User['lastLoginAt']>>;
        where['lastLoginAt'][Op.gte] = queryDto[key]!;
        return;
      }
       if (key === 'endLastLoginAt') {
        where['lastLoginAt'] = (where['lastLoginAt'] ?? {}) as WhereOperators<NonNullable<User['lastLoginAt']>>;
        where['lastLoginAt'][Op.lte] = queryDto[key]!;
        return;
      }
      (where as Record<keyof typeof where, any>)[key] = queryDto[key]; //因为 where[key as Exclude<typeof key,'page'|'pageSize'>] = queryDto[key]; 赋值会触发 TS2590: Expression produces a union type that is too complex to represent.
    });
    const { count, rows } = await this.userRepository.findAndCountAll({
      where,
      offset: (queryDto.page - 1) * queryDto.pageSize,
      limit: queryDto.pageSize,
      include: [
        'createdUser',
        {
          association: 'avatar',
          attributes: { exclude: [] }, //必须设置attributes，否则file的附件属性 url属性返回给前端时没有，已提交[BUG反馈](https://github.com/sequelize/sequelize/issues/18059)
        },
      ],
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
    const entity = await this.userRepository.findByPk(id, {
      include: [
        'createdUser',
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
  @Transaction()
  async update(id: string, updateDto: UserUpdateDto) {
    const entity = await this.userRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    const password = entity.password;
    const salf = entity.salt;
    Object.assign(entity, updateDto);
    if (updateDto.password) {
      Object.assign(entity, this.userLoginService.entityPassword(updateDto.password));
    } else {
      entity.password = password;
      entity.salt = salf;
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
  @Transaction()
  async remove(id: string) {
    const entity = await this.userRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    await entity.destroy();
  }
}
