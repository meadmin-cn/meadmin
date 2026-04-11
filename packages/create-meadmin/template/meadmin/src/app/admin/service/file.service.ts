import { InjectRepository } from '@/decorators/index.js';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { InferAttributes, Op, WhereOperators } from '@sequelize/core';
import { WhereAttributeHash } from '@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/where-sql-builder-types.js';
import { File } from '../../../entities/file.entity.js';
import { FileCreateDto } from '../dto/fileCreate.dto.js';
import { FileQueryDto } from '../dto/fileQuery.dto.js';
import { FileUpdateDto } from '../dto/fileUpdate.dto.js';

//附件
@Provide()
export class FileService {
  @InjectRepository(File)
  FileRepository: typeof File;

  @Inject()
  i18nService: MidwayI18nService;

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
    const where = {} as WhereAttributeHash<InferAttributes<File, { omit: never }>>;
    (Object.keys(queryDto) as Array<keyof FileQueryDto>).forEach((key) => {
      if ('page' === key || 'pageSize' === key) {
        return;
      }
      if (null === queryDto[key] || undefined === queryDto[key] || '' === queryDto[key]) {
        return;
      }
      if (key === 'startCreatedAt') {
        where['createdAt'] = (where['createdAt'] ?? {}) as WhereOperators<File['createdAt']>;
        where['createdAt'] = { ...where['createdAt'], [Op.gte]: queryDto[key] };
        return;
      }
      if (key === 'endCreatedAt') {
        where['createdAt'] = (where['createdAt'] ?? {}) as WhereOperators<File['createdAt']>;
        where['createdAt'][Op.lte] = queryDto[key];
        return;
      }
      if (key === 'startUpdatedAt') {
        where['updatedAt'] = (where['updatedAt'] ?? {}) as WhereOperators<File['updatedAt']>;
        where['updatedAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endUpdatedAt') {
        where['updatedAt'] = (where['updatedAt'] ?? {}) as WhereOperators<File['updatedAt']>;
        where['updatedAt'][Op.lte] = queryDto[key];
        return;
      }
      (where as Record<keyof typeof where, any>)[key] = queryDto[key]; //where[key as Exclude<typeof key,'page'|'pageSize'>] = queryDto[key]; 赋值会触发 TS2590: Expression produces a union type that is too complex to represent.
    });
    const { count, rows } = await this.FileRepository.findAndCountAll({
      include: ['createdAdmin', 'updatedAdmin'],
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
    const entity = await this.FileRepository.findByPk(id, {
      include: ['createdAdmin', 'updatedAdmin'],
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
  async update(id: string, updateDto: FileUpdateDto) {
    const entity = await this.FileRepository.findByPk(id);
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
    const entity = await this.FileRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    await entity.destroy();
  }
}
