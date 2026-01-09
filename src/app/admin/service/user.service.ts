import { InjectRepository, Transaction } from '@/decorators/index.js';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { Op } from '@sequelize/core';
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
    const where = {};
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
    const where = {};
    Object.keys(queryDto).forEach((key) => {
      if (['page', 'pageSize'].includes(key)) {
        return;
      }
      if ([null, undefined, ''].includes(queryDto[key])) {
        return;
      }
      if (key === 'startLastLoginAt') {
        where['lastLoginAt'] = where['lastLoginAt'] ?? {};
        where['lastLoginAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endLastLoginAt') {
        where['lastLoginAt'] = where['lastLoginAt'] ?? {};
        where['lastLoginAt'][Op.lte] = queryDto[key];
        return;
      }
      if (key === 'startCreatedAt') {
        where['createdAt'] = where['createdAt'] ?? {};
        where['createdAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endCreatedAt') {
        where['createdAt'] = where['createdAt'] ?? {};
        where['createdAt'][Op.lte] = queryDto[key];
        return;
      }
      if (key === 'startUpdatedAt') {
        where['updatedAt'] = where['updatedAt'] ?? {};
        where['updatedAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endUpdatedAt') {
        where['updatedAt'] = where['updatedAt'] ?? {};
        where['updatedAt'][Op.lte] = queryDto[key];
        return;
      }
      where[key] = queryDto[key];
    });
    const { count, rows } = await this.userRepository.findAndCountAll({
      where,
      offset: (queryDto.page - 1) * queryDto.pageSize,
      limit: queryDto.pageSize,
      include: ['createdUser', 'avatar'],
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
    const entity = await this.userRepository.findByPk(id, { include: ['createdUser', 'avatar'] });
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
    Object.assign(entity, updateDto);

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
