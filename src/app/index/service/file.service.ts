import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { InjectRepository } from '@/decorators/index.js';
import { Inject, Provide } from '@midwayjs/core';
import { FileCreateDto } from '../dto/fileCreate.dto.js';
import { FileQueryDto } from '../dto/fileQuery.dto.js';
import { FileUpdateDto } from '../dto/fileUpdate.dto.js';
import { UserFile } from '../../../entities/userFile.entity.js';
import { Op } from '@sequelize/core';
import { Context } from '@midwayjs/koa';

//附件
@Provide()
export class FileService {
  @InjectRepository(UserFile)
  FileRepository: typeof UserFile;

  @Inject()
  ctx: Context;

  /**
   * 创建数据
   * @param createDto
   * @returns
   */
  async create(createDto: FileCreateDto) {
    const entity = this.FileRepository.build(createDto);
    return await entity.save();
  }

  /**
   * 列表分页查询
   * @param queryDto 查询条件
   * @returns
   */
  async list(queryDto: FileQueryDto) {
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
    const { count, rows } = await this.FileRepository.findAndCountAll({
      include:['createdUser','updatedUser'],
      where,
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
   * 根据主键获取一条信息
   * @param id 主键
   * @returns
   */
  async findOne(id: string) {
    const entity = await this.FileRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError('没有对应的信息');
    }
    return entity;
  }

  /**
   * 更新数据
   * @param id 主键
   * @param updateDto 数据对象
   * @returns
   */
  async update(id: string, updateDto: FileUpdateDto) {
    const entity = await this.FileRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError('没有对应的信息');
    }
    if(entity.createdUserId !== this.ctx.userInfo.id){
      throw new BadRequestError('只能更改自己的附件');
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
    const entity = await this.FileRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError('没有对应的信息');
    }
    if(entity.createdUserId !== this.ctx.userInfo.id){
      throw new BadRequestError('只能删除自己的附件');
    }
    await entity.destroy();
  }
}
