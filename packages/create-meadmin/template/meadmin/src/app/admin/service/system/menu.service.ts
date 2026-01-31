import { InjectRepository } from '@/decorators/index.js';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { Op } from '@sequelize/core';
import { SystemMenu } from '../../../../entities/systemMenu.entity.js';
import { SystemMenuCreateDto } from '../../dto/system/menuCreate.dto.js';
import { SystemMenuQueryDto } from '../../dto/system/menuQuery.dto.js';
import { SystemMenuUpdateDto } from '../../dto/system/menuUpdate.dto.js';

//菜单
@Provide()
export class SystemMenuService {
  @InjectRepository(SystemMenu)
  SystemMenuRepository: typeof SystemMenu;

  @Inject()
  i18nService: MidwayI18nService;

  /**
   * 创建数据
   * @param createDto
   * @returns
   */
  async create(createDto: SystemMenuCreateDto) {
    const entity = this.SystemMenuRepository.build(createDto);
    return await entity.save();
  }

  /**
   * 列表分页查询
   * @param queryDto 查询条件
   * @returns
   */
  async list(queryDto: SystemMenuQueryDto) {
    const where = {};
    Object.keys(queryDto).forEach((key) => {
      if (['page', 'pageSize'].includes(key)) {
        return;
      }
      if ([null, undefined, ''].includes(queryDto[key])) {
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
    const { count, rows } = await this.SystemMenuRepository.findAndCountAll({
      where,
      include: ['createdAdmin', 'updatedAdmin'],
      offset: (queryDto.page - 1) * queryDto.pageSize,
      limit: queryDto.pageSize,
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
   * 获取角色树形结构
   * @returns
   */
  async treeAll() {
    return await this.SystemMenuRepository.getTree({
      order: [['orderNum', 'DESC']],
    });
  }

  /**
   * 根据主键获取一条信息
   * @param id 主键
   * @returns
   */
  async findOne(id: string) {
    const entity = await this.SystemMenuRepository.findByPk(id, {
      include: ['parent', 'createdAdmin', 'updatedAdmin'],
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
  async update(id: string, updateDto: SystemMenuUpdateDto) {
    const entity = await this.SystemMenuRepository.findByPk(id);
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
    const entity = await this.SystemMenuRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    await entity.destroy();
  }
}
