import { formatWhere } from '@/helper/formWhere.js';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { InjectRepository } from '@/decorators/index.js';
import { Provide } from '@midwayjs/core';
import { __CreateDto__ } from '__createDtoPath__';
import { __QueryDto__ } from '__queryDtoPath__';
import { __UpdateDto__ } from '__updateDtoPath__';
import { __Name__ } from '__entityPath__';


@Provide()
export class __Service__ {
  @InjectRepository(__Name__)
  __Name__Repository: typeof __Name__

  /**
   * 创建数据
   * @param createDto
   * @returns
   */
  async create(createDto: __CreateDto__) {
    const entity = this.__Name__Repository.build(createDto);
    return await entity.save();
  }

  private formatWhere(query: __QueryDto__) {
    return formatWhere(
      Object.assign({}, query, { page: undefined, size: undefined }),
      { likeField:__likeField__ }//模糊搜索的字段
    );
  }

  /**
   * 分页查询数据
   * @param queryDto 查询条件
   * @returns
   */
  findAll(queryDto: __QueryDto__) {
    return this.__Name__Repository.findAll({
      offset: (queryDto.page - 1) * queryDto.size,
      limit: queryDto.size,
      where: this.formatWhere(queryDto),
    });
  }

  /**
   * 获取数量
   * @param queryDto 查询条件
   * @returns
   */
  count(queryDto: __QueryDto__) {
    return this.__Name__Repository.count({ where: this.formatWhere(queryDto) });
  }

  /**
   * 根据主键获取一条信息
   * @param __pk__ 主键
   * @returns
   */
  findOne(__pk__: string) {
    return this.__Name__Repository.findByPk(__pk__);
  }

  /**
   * 更新数据
   * @param __pk__ 主键
   * @param updateDto 数据对象
   * @returns
   */
  async update(__pk__: string, updateDto: __UpdateDto__) {
    const entity = await this.__Name__Repository.findByPk(__pk__);
    if (!entity) {
      throw new BadRequestError('没有对应的信息');
    }
    Object.assign(entity, updateDto, { __pk__ });
    return await entity.save();
  }

  /**
   * 删除数据
   * @param __pk__ 主键
   * @returns
   */
  async remove(__pk__: string) {
    const entity = await this.__Name__Repository.findByPk(__pk__);
    if (!entity) {
      throw new BadRequestError('没有对应的信息');
    }
    await entity.destroy();
    return true;
  }
}
