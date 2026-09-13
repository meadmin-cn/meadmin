import { InjectRepository } from '@/decorators/index.js';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { InferAttributes, Op, WhereOperators } from '@sequelize/core';
import { WhereAttributeHash } from '@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/where-sql-builder-types.js';
import { SystemMenu } from '../../../../entities/systemMenu.entity.js';
import { SystemRole } from '../../../../entities/systemRole.entity.js';
import { SystemMenuCreateDto } from '../../dto/system/menuCreate.dto.js';
import { SystemMenuQueryDto } from '../../dto/system/menuQuery.dto.js';
import { SystemMenuUpdateDto } from '../../dto/system/menuUpdate.dto.js';

//菜单
@Provide()
export class SystemMenuService {
  @InjectRepository(SystemMenu)
  SystemMenuRepository: typeof SystemMenu;

  @InjectRepository(SystemRole)
  SystemRoleRepository: typeof SystemRole;

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
    const where = {} as WhereAttributeHash<InferAttributes<SystemMenu, { omit: never }>>;
    (Object.keys(queryDto) as Array<keyof SystemMenuQueryDto>).forEach((key) => {
      if ('page' === key || 'pageSize' === key) {
        return;
      }
      if (null === queryDto[key] || undefined === queryDto[key] || '' === queryDto[key]) {
        return;
      }
      if (key === 'startCreatedAt') {
        where['createdAt'] = (where['createdAt'] ?? {}) as WhereOperators<SystemMenu['createdAt']>;
        where['createdAt'] = { ...where['createdAt'], [Op.gte]: queryDto[key] };
        return;
      }
      if (key === 'endCreatedAt') {
        where['createdAt'] = (where['createdAt'] ?? {}) as WhereOperators<SystemMenu['createdAt']>;
        where['createdAt'][Op.lte] = queryDto[key];
        return;
      }
      if (key === 'startUpdatedAt') {
        where['updatedAt'] = (where['updatedAt'] ?? {}) as WhereOperators<SystemMenu['updatedAt']>;
        where['updatedAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endUpdatedAt') {
        where['updatedAt'] = (where['updatedAt'] ?? {}) as WhereOperators<SystemMenu['updatedAt']>;
        where['updatedAt'][Op.lte] = queryDto[key];
        return;
      }
      (where as Record<keyof typeof where, any>)[key] = queryDto[key]; //因为 where[key as Exclude<typeof key,'page'|'pageSize'>] = queryDto[key]; 赋值会触发 TS2590: Expression produces a union type that is too complex to represent.
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

  async perfectTree() {
    return await this.SystemMenuRepository.perfectTree();
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
    // 处理旧菜单的祖级
    const parentChanged = updateDto.parentId !== undefined && updateDto.parentId !== entity.parentId;
    const oldLeft = entity.left;
    const oldRight = entity.right;
    // 更新菜单前只记录旧父级和祖级 ID；菜单移动后左右边界会变化，不能再用旧边界定位。
    const oldAncestorIds =
      parentChanged && oldLeft != null && oldRight != null
        ? (
            await this.SystemMenuRepository.findAll({
              attributes: ['id'],
              where: { left: { [Op.lt]: oldLeft }, right: { [Op.gt]: oldRight } },
              order: [['left', 'DESC']],
            })
          ).map(({ id: ancestorId }) => ancestorId)
        : [];

    Object.assign(entity, updateDto);
    const result = await entity.save();

    // 旧树：更新后只查询关联旧父级和祖级的角色
    if (parentChanged && oldAncestorIds.length) {
      const oldRoles = await this.SystemRoleRepository.findAll({
        include: [
          {
            association: 'menus',
            attributes: ['id', 'left', 'right', 'parentId'],
            where: { id: { [Op.in]: oldAncestorIds } },
            required: true,
          },
        ],
      });
      // 每个角色单独计算 removeIds，避免一个角色的权限影响另一个角色。
      await Promise.all(
        oldRoles.map((role) => {
          // right - left === 1 表示该菜单没有任何子级，只移除当前角色中的这类旧父级权限。
          const removeIds = role.menus?.filter(({ left, right }) => left != null && right != null && right - left === 1).map(({ id }) => id) ?? [];
          if (!removeIds.length) return Promise.resolve();
          // 当前角色已关联待删除菜单，直接删除该角色自己的旧父级关联。
          return role.removeMenus(removeIds);
        }),
      );
    }

    // 新树：单独处理新父级和祖级权限补齐。
    if (parentChanged && result.left != null && result.right != null) {
      // 查询移动后当前菜单的新祖级。
      const ancestors = await this.SystemMenuRepository.findAll({
        attributes: ['id'],
        where: { left: { [Op.lt]: result.left }, right: { [Op.gt]: result.right } },
        order: [['left', 'ASC']],
      });
      // 查询当前菜单关联的角色。
      const roles = await this.SystemRoleRepository.findAll({
        include: [{ association: 'menus', attributes: ['id'], where: { id }, required: true }],
      });
      const newParentIds = ancestors.map(({ id }) => id);
      // 查询当前菜单关联的角色，附上新的祖级权限。
      await Promise.all(roles.map((role) => role.addMenus([...newParentIds], { ignoreDuplicates: true })));
    }

    return result;
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
    const roles = await this.SystemRoleRepository.findAll({
      include: [{ association: 'menus', attributes: ['id'], where: { id }, required: true }],
    });
    await Promise.all(roles.map((role) => role.removeMenus([id])));
    await entity.destroy();
  }
}
