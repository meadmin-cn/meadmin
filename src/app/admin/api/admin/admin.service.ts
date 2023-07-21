import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './entities/admin.entity';
import { QueryAdminDto } from './dto/query-admin.dto';
import { formatWhere } from '@/utils/formatWhere';
import { pbkdf2Sync, randomBytes } from 'node:crypto';

@Injectable()
export class AdminService {
  /**
   * 密码加密
   * @param password 密码
   * @returns {salt:密码盐,password:密码密文}
   */
  private entityPassword(password: string, salt?: string) {
    let newSalt: Buffer;
    if (salt) {
      newSalt = Buffer.from(salt, 'hex');
    } else {
      newSalt = randomBytes(32);
    }
    const ciphertext = pbkdf2Sync(
      password,
      newSalt,
      1000,
      32,
      'sha3-256',
    ).toString('hex');
    return { salt: salt ?? newSalt.toString('hex'), password: ciphertext };
  }

  /**
   * 校验密码
   * @param password 密码
   * @param salt 密码盐
   * @param encode 加密字符串
   * @returns 是否通过
   */
  public checkPassword(password: string, salt: string, encode: string) {
    return this.entityPassword(password, salt).password === encode;
  }

  /**
   * 创建数据
   * @param createAdminDto
   * @returns
   */
  create(createAdminDto: CreateAdminDto) {
    return Admin.save<Admin>(
      Object.assign(
        {},
        createAdminDto,
        this.entityPassword(createAdminDto.password),
      ),
    );
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
    return Admin.find({
      skip: (queryAdminDto.page - 1) * queryAdminDto.size,
      take: queryAdminDto.size,
      where: this.formatWhere(queryAdminDto),
    });
  }

  /**
   * 获取数量
   * @param queryAdminDto 查询条件
   * @returns
   */
  count(queryAdminDto: Partial<QueryAdminDto>) {
    return Admin.countBy(this.formatWhere(queryAdminDto));
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
    const entity = await Admin.findOneByOrFail({ id });
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
    const entity = await Admin.findOneByOrFail({ id });
    await entity.softRemove();
    return Boolean(entity.deletedAt);
  }
}
