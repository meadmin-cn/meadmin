import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { InjectRepository } from '@/decorators/index.js';
import { Provide } from '@midwayjs/core';
import { RoleCreateDto } from '../dto/roleCreate.dto.js';
import { RoleQueryDto } from '../dto/roleQuery.dto.js';
import { RoleUpdateDto } from '../dto/roleUpdate.dto.js';
import { Role } from '../../../entities/role.entity.js';
import { Op, WhereOptions } from '@sequelize/core';

@Provide()
export class RoleService {
  @InjectRepository(Role)
  RoleRepository: typeof Role

  /**
   * 创建数据
   * @param createDto
   * @returns
   */
  async create(createDto: RoleCreateDto) {
    const entity = this.RoleRepository.build(createDto);
    return await entity.save();
  }

  /**
   * 列表分页查询
   * @param queryDto 查询条件
   * @returns
   */
  async list(queryDto: RoleQueryDto) {
    const where = {};
    Object.keys(queryDto).forEach((key) => {
      if (key === 'page') {
        return;
      }
      if (key === 'size') {
        return;
      }
      if (key === 'startCreateAt') {
        where['createAt'] = where['createAt'] ?? {};
        where['createAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endCreateAt') {
        where['createAt'] = where['createAt'] ?? {};
        where['createAt'][Op.lte] = queryDto[key];
        return;
      }
      if (key === 'startUpdateAt') {
        where['updateAt'] = where['updateAt'] ?? {};
        where['updateAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endUpdateAt') {
        where['updateAt'] = where['updateAt'] ?? {};
        where['updateAt'][Op.lte] = queryDto[key];
        return;
      }
    });
    return {
      list: await this.findAll(where, queryDto.page, queryDto.size),
      total: await this.count(where),
      page: queryDto.page,
      size: queryDto.size,
    };
  }

  /**
   * 分页查询数据
   * @param queryWhere 查询条件
   * @returns
   */
  findAll(queryWhere: WhereOptions<Role>, page: number, size: number) {
    return this.RoleRepository.findAll({
      offset: (page - 1) * size,
      limit: size,
      where: queryWhere,
    });
  }

  /**
   * 获取数量
   * @param queryWhere 查询条件
   * @returns
   */
  count(queryWhere: WhereOptions<Role>) {
    return this.RoleRepository.count({ where: queryWhere });
  }

  /**
   * 根据主键获取一条信息
   * @param id 主键
   * @returns
   */
  findOne(id: string) {
    const entity = this.RoleRepository.findByPk(id);
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
  async update(id: string, updateDto: RoleUpdateDto) {
    const entity = await this.RoleRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError('没有对应的信息');
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
    const entity = await this.RoleRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError('没有对应的信息');
    }
    await entity.destroy();
  }
}
