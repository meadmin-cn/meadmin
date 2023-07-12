import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './entities/admin.entity';
import { QueryAdminDto } from './dto/query-admin.dto';
import { formatWhere } from '@/utils/formatWhere';

@Injectable()
export class AdminService {
  /**
   * 创建数据
   * @param createAdminDto
   * @returns
   */
  create(createAdminDto: CreateAdminDto) {
    return Admin.save(createAdminDto);
  }

  /**
   * 分页查询数据
   * @param queryAdminDto 查询条件
   * @returns
   */
  findAll(queryAdminDto: QueryAdminDto) {
    return Admin.find({
      skip: (queryAdminDto.page - 1) * queryAdminDto.size,
      take: queryAdminDto.size,
      where: formatWhere(
        Object.assign({}, queryAdminDto, { page: undefined, size: undefined }),
      ),
    });
  }

  /**
   * 获取数量
   * @param queryAdminDto 查询条件
   * @returns
   */
  count(queryAdminDto: QueryAdminDto) {
    return Admin.count({
      where: formatWhere(
        Object.assign({}, queryAdminDto, { page: undefined, size: undefined }),
      ),
    });
  }

  /**
   * 获取一条信息
   * @param id 主键id
   * @returns
   */
  findOne(id: number) {
    return Admin.findOneByOrFail({ id });
  }

  /**
   * 更新数据
   * @param id 主键id
   * @param updateAdminDto 数据对象
   * @returns
   */
  async update(id: number, updateAdminDto: UpdateAdminDto) {
    await Admin.findOneByOrFail({ id });
    return Admin.save({ id, ...updateAdminDto });
  }

  /**
   * 删除数据
   * @param id 主键id
   * @returns
   */
  async remove(id: number) {
    const entity = await Admin.findOneByOrFail({ id });
    return await entity.softRemove();
  }
}
