import { InjectRepository, Transaction } from '@/decorators/index.js';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { Attributes, Op, WhereOptions } from '@sequelize/core';
import { AonDoc } from '../../../../../entities/aonDoc.entity.js';
import { AonDocCreateDto } from '../dto/docCreate.dto.js';
import { AonDocQueryDto } from '../dto/docQuery.dto.js';
import { AonDocUpdateDto } from '../dto/docUpdate.dto.js';

//文档
@Provide()
export class AonDocService {
  @InjectRepository(AonDoc)
  aonDocRepository: typeof AonDoc;

  @Inject()
  i18nService: MidwayI18nService;

  /**
   * 获取角色树形结构
   * @param version
   * @returns
   */
  async treeAll(version?: string) {
    const where: WhereOptions<Attributes<AonDoc>> = {};
    if (version) {
      where.version = version;
    }
    return await this.aonDocRepository.getTree({
      include: [
        'createdAdmin',
        'updatedAdmin',
        {
          association: 'icon',
          attributes: { exclude: [] }, //必须设置attributes，否则file的附件属性 url属性返回给前端时没有，已提交[BUG反馈](https://github.com/sequelize/sequelize/issues/18059)
        },
      ],
      where,
      order: [['orderNum', 'DESC']],
    });
  }

  /**
   * 创建数据
   * @param createDto
   * @returns
   */
  @Transaction()
  async create(createDto: AonDocCreateDto) {
    if (createDto.type !== 2) {
      createDto.contentType = null;
    }
    if (createDto.contentType !== 0) {
      createDto.mdContent = '';
    }
    if (createDto.contentType !== 1) {
      createDto.link = '';
    }
    const entity = await this.aonDocRepository.create(createDto);
    if (createDto.icon) {
      //关联模型用主键进行设置，用对象设置时必须确保对象为模型model的实例
      await entity.setIcon(createDto.icon.id);
    }
    return entity;
  }

  /**
   * 列表分页查询
   * @param queryDto 查询条件
   * @returns
   */
  @Transaction()
  async list(queryDto: AonDocQueryDto) {
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
    const { count, rows } = await this.aonDocRepository.findAndCountAll({
      where,
      offset: (queryDto.page - 1) * queryDto.pageSize,
      limit: queryDto.pageSize,
      include: [
        'createdAdmin',
        'updatedAdmin',
        'parent',
        {
          association: 'icon',
          attributes: { exclude: [] }, //必须设置attributes，否则file的附件属性 url属性返回给前端时没有，已提交[BUG反馈](https://github.com/sequelize/sequelize/issues/18059)
        },
      ],
      order: [['orderNum', 'DESC']],
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
    const entity = await this.aonDocRepository.findByPk(id, {
      include: [
        'createdAdmin',
        'updatedAdmin',
        'parent',
        {
          association: 'icon',
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
  async update(id: string, updateDto: AonDocUpdateDto) {
    const entity = await this.aonDocRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    Object.assign(entity, updateDto);
    if (entity.type !== 2) {
      entity.contentType = null;
    }
    if (entity.contentType !== 0) {
      entity.mdContent = '';
    }
    if (entity.contentType !== 1) {
      entity.link = '';
    }
    if (updateDto.icon !== undefined) {
      //关联模型用主键进行设置，用对象设置时必须确保对象为模型model的实例
      await entity.setIcon(updateDto.icon?.id ?? null);
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
    const entity = await this.aonDocRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    await entity.destroy();
  }
}
