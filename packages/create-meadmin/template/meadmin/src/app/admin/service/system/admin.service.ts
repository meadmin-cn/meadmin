import { InjectRepository } from '@/decorators/index.js';
import { SystemMenu } from '@/entities/systemMenu.entity.js';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { Op } from '@sequelize/core';
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
    const where = {};
    Object.keys(queryDto).forEach((key) => {
      if (['page', 'pageSize'].includes(key)) {
        return;
      }
      if ([null, undefined, ''].includes(queryDto[key])) {
        return;
      }
      if (['username', 'nickname', 'mobile'].includes(key)) {
        where[key] = { [Op.like]: `%${queryDto[key]}%` };
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
