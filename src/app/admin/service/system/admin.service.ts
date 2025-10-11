import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { InjectRepository } from '@/decorators/index.js';
import { Provide, Inject } from '@midwayjs/core';
import { SystemAdminCreateDto } from '../../dto/system/adminCreate.dto.js';
import { SystemAdminQueryDto } from '../../dto/system/adminQuery.dto.js';
import { SystemAdminUpdateDto } from '../../dto/system/adminUpdate.dto.js';
import { SystemAdmin } from '../../../../entities/systemAdmin.entity.js';
import { Op } from '@sequelize/core';
import { I18nService } from '@/service/i18n.service.js';

//管理员
@Provide()
export class SystemAdminService {
  @InjectRepository(SystemAdmin)
  SystemAdminRepository: typeof SystemAdmin;

  @Inject()
  i18nService: I18nService;

  /**
   * 创建数据
   * @param createDto
   * @returns
   */
  async create(createDto: SystemAdminCreateDto) {
    const entity = this.SystemAdminRepository.build(createDto);
    return await entity.save();
  }

  /**
   * 列表分页查询
   * @param queryDto 查询条件
   * @returns
   */
  async list(queryDto: SystemAdminQueryDto) {
    const where = {};
    Object.keys(queryDto).forEach((key) => {
      if (key === 'page') {
        return;
      }
      if (key === 'size') {
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
    });
    const { count, rows } = await this.SystemAdminRepository.findAndCountAll({
      where,
      offset: (queryDto.page - 1) * queryDto.size,
      limit: queryDto.size,
      order: [['createdAt', 'DESC']],
    });
    return {
      list: rows,
      total: count,
      page: queryDto.page,
      size: queryDto.size,
    };
  }

  /**
   * 根据主键获取一条信息
   * @param id 主键
   * @returns
   */
  findOne(id: string) {
    const entity = this.SystemAdminRepository.findByPk(id);
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
    Object.assign(entity, updateDto);
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
