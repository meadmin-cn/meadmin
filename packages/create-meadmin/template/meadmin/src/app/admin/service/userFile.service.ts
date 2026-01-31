import { InjectRepository, Transaction } from '@/decorators/index.js';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { Op } from '@sequelize/core';
import { UserFile } from '../../../entities/userFile.entity.js';
import { UserFileCreateDto } from '../dto/userFileCreate.dto.js';
import { UserFileQueryDto } from '../dto/userFileQuery.dto.js';
import { UserFileUpdateDto } from '../dto/userFileUpdate.dto.js';

//用户附件表(前台)
@Provide()
export class UserFileService {
  @InjectRepository(UserFile)
  userFileRepository: typeof UserFile;

  @Inject()
  i18nService: MidwayI18nService;

  /**
   * 创建数据
   * @param createDto
   * @returns
   */
  @Transaction()
  async create(createDto: UserFileCreateDto) {
    const entity = await this.userFileRepository.create(createDto);
    return entity;
  }

  /**
   * 列表分页查询
   * @param queryDto 查询条件
   * @returns
   */
  @Transaction()
  async list(queryDto: UserFileQueryDto) {
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
    const { count, rows } = await this.userFileRepository.findAndCountAll({
      where,
      offset: (queryDto.page - 1) * queryDto.pageSize,
      limit: queryDto.pageSize,
      include: ['createdUser', 'updatedUser', 'createdAdmin', 'updatedAdmin'],
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
    const entity = await this.userFileRepository.findByPk(id, { include: ['createdUser', 'updatedUser', 'createdAdmin', 'updatedAdmin'] });
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
  async update(id: string, updateDto: UserFileUpdateDto) {
    const entity = await this.userFileRepository.findByPk(id);
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
  @Transaction()
  async remove(id: string) {
    const entity = await this.userFileRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    await entity.destroy();
  }
}
