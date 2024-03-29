import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './entities/admin.entity';
import { QueryAdminDto } from './dto/query-admin.dto';
import { formatWhere } from '@/utils/formatWhere';
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { ForbiddenException } from '@/exception/forbidden-exception';

@Injectable()
export class AdminService {
  /**
   * 密码加密
   * @param password 密码
   * @returns {salt:密码盐,password:密码密文}
   */
  private entityPassword(password: string, salt?: Buffer) {
    let newSalt: Buffer;
    if (salt) {
      newSalt = salt;
    } else {
      newSalt = randomBytes(32);
    }
    console.log(newSalt.toString('hex'));
    const ciphertext = pbkdf2Sync(password, newSalt, 1000, 32, 'sha3-256');
    return { salt: newSalt, password: ciphertext };
  }

  /**
   * 校验密码
   * @param password 密码
   * @param salt 密码盐
   * @param encode 加密字符串
   * @returns 是否通过
   */
  public checkPassword(password: string, salt: Buffer, encode: Buffer) {
    return this.entityPassword(password, salt).password === encode;
  }

  /**
   * 创建数据
   * @param createAdminDto
   * @returns
   */
  async create(createAdminDto: CreateAdminDto) {
    const entity = Admin.build(
      Object.assign(
        createAdminDto,
        this.entityPassword(createAdminDto.password),
      ),
    );
    return await entity.save();
  }

  private formatWhere(query: Partial<QueryAdminDto>) {
    return formatWhere(
      Object.assign({}, query, { page: undefined, size: undefined }),
      { likeField: ['nickname'] },
    );
  }

  /**
   * 分页查询数据
   * @param queryAdminDto 查询条件
   * @returns
   */
  findAll(queryAdminDto: QueryAdminDto) {
    console.log(this.formatWhere(queryAdminDto));
    return Admin.findAll({
      offset: (queryAdminDto.page - 1) * queryAdminDto.size,
      limit: queryAdminDto.size,
      where: this.formatWhere(queryAdminDto),
    });
  }

  /**
   * 获取数量
   * @param queryAdminDto 查询条件
   * @returns
   */
  count(queryAdminDto: Partial<QueryAdminDto>) {
    return Admin.count({ where: this.formatWhere(queryAdminDto) });
  }

  /**
   * 获取一条信息
   * @param id 主键id
   * @returns
   */
  findOne(id: number) {
    return Admin.findByPk(id);
  }

  /**
   * 更新数据
   * @param id 主键id
   * @param updateAdminDto 数据对象
   * @returns
   */
  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const entity = await Admin.findByPk(id);
    if (!entity) {
      throw new ForbiddenException('没用对应的信息');
    }
    Object.assign(entity, updateAdminDto);
    if (updateAdminDto.password) {
      entity.password = this.entityPassword(
        updateAdminDto.password,
        entity.salt,
      ).password;
    }
    return await entity.save();
  }

  /**
   * 删除数据
   * @param id 主键id
   * @returns
   */
  async remove(id: number) {
    const entity = await Admin.findByPk(id);
    if (!entity) {
      throw new ForbiddenException('没用对应的信息');
    }
    await entity.destroy();
    return Boolean(entity.deletionDate);
  }
}
