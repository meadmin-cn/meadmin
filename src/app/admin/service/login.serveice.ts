import { Transaction } from '@/decorators/index.js';
import { InjectRepository } from '@/decorators/sequelize.js';
import { SystemAdmin } from '@/entities/systemAdmin.entity.js';
import { SystemMenu } from '@/entities/systemMenu.entity.js';
import { SystemRole } from '@/entities/systemRole.entity.js';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { Config, Init, Inject, Singleton } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { Context } from '@midwayjs/koa';
import dayjs from 'dayjs';
import { pbkdf2Sync, randomBytes } from 'node:crypto';

export const tokenPrefix = 'Admin:Token:';
export const adminPrefix = 'Admin:Admin:';
@Singleton()
export class LoginService {
  @InjectRepository(SystemAdmin)
  adminRepository: typeof SystemAdmin;

  @InjectRepository(SystemMenu)
  menuRepository: typeof SystemMenu;

  @Inject()
  cachingFactory: CachingFactory;

  @Config('admin.login.expiresIn')
  expiresIn: number; //过期时间ms

  @Config('admin.login.secret')
  secret: string; //加密secret

  @Config('admin.login.cacheKey')
  cacheKey: string; //token使用的缓存key对应cacheManager.clients

  cache: MidwayCache;

  @Init()
  async init() {
    this.cache = await this.cachingFactory.get(this.cacheKey);
  }

  getAdminIdCacheKey(adminId: string) {
    return adminPrefix + adminId;
  }

  getTokenCacheKey(token: string) {
    return tokenPrefix + token;
  }

  //根据管理员id获取token列表
  async getAdminTokens(adminId: string) {
    let adminTokens = ((await this.cache.get(this.getAdminIdCacheKey(adminId))) ?? []) as Array<{ token: string; expiresInTime: number; expiresInTimeStr: string }>;
    if (adminTokens.length) {
      const nowTime = +new Date();
      adminTokens = adminTokens.filter((item) => item.expiresInTime > +nowTime);
      await this.cache.set(this.getAdminIdCacheKey(adminId), adminTokens);
    }
    return adminTokens;
  }

  /**
   * 创建token，极限情况下，会有概率token重复，如果并发过高，可以用redis lua重写这里。
   * @param adminId;
   * @returns;
   */
  async createToken(adminId: string):Promise<string> {
    const secret = this.secret + new Date();
    const token = pbkdf2Sync(tokenPrefix + adminId, secret, 1000, 32, 'md5').toString('hex');
    if (await this.cache.get(this.getTokenCacheKey(token))) {
      return await this.createToken(adminId);
    }
    this.cache.set(this.getTokenCacheKey(token), ' ', 2000);
    return token;
  }

  //获取新token
  async getToken(adminId: string) {
    const adminTokens = await this.getAdminTokens(adminId);
    const expiresInTime = this.expiresIn + +new Date();
    const token = await this.createToken(adminId);
    const tokenInfo = {
      token,
      expiresInTime,
      expiresInTimeStr: dayjs(expiresInTime).format('YYYY-MM-DD HH:mm:ss.SSS'),
    };
    adminTokens.push(tokenInfo);
    await this.cache.set(this.getTokenCacheKey(token), adminId, this.expiresIn);
    await this.cache.set(this.getAdminIdCacheKey(adminId), adminTokens);
    return tokenInfo;
  }

  //根据token获取用户id
  async getIdByToken(token: string) {
    return await this.cache.get<string>(this.getTokenCacheKey(token));
  }

  /**
   * 根据token获取用户信息
   * @param token
   * @returns
   */
  async getAdminByToken(token: string) {
    const adminId = await this.getIdByToken(token);
    if (adminId) {
      return await this.getAdminById(adminId);
    }
    return null;
  }

  /**
   * 根据管理员信息获取管理员详情
   * @param adminId
   * @returns
   */
  async getAdminById(adminId: string) {
    const admin = await this.adminRepository.findOne({
      where: {
        id: adminId,
      },
      include: [
        {
          model: SystemRole,
          where: { status: 1 },
          required: false,
          include: [
            {
              model: SystemMenu,
              where: { status: 1 },
              required: false,
            },
          ],
        },
        {
          association: 'avatar',
          attributes: { exclude: [] }, //必须设置attributes，否则file的附件属性 url属性返回给前端时没有，已提交[BUG反馈](https://github.com/sequelize/sequelize/issues/18059)
        },
      ],
    });
    if (admin?.roles?.some((item) => item.isSuper === 1)) {
      admin.roleMenus = await this.menuRepository.findAll({
        where: { status: 1 },
      });
    }
    return admin;
  }

  //移除token
  async removeToken(token: string) {
    const adminId = await this.getIdByToken(token);
    if (adminId) {
      await this.cache.del(this.getTokenCacheKey(token));
      let adminTokens = await this.getAdminTokens(adminId);
      adminTokens = adminTokens.filter((item) => item.token !== token);
      await this.cache.set(this.getAdminIdCacheKey(adminId), adminTokens);
    }
  }

  /**
   * 登录
   * @param username 用户名
   * @param password 密码
   * @param ctx      请求上下文
   * @returns
   */
  @Transaction()
  async login(username: string, password: string, ctx?: Context) {
    const entity = await this.adminRepository.findOne({ where: { username } });

    let translate: MidwayI18nService['translate'] | undefined;
    if (ctx) {
      const i18n = await ctx.requestContext.getAsync(MidwayI18nService);
      translate = (...args) => i18n.translate(...args);
    }
    if (entity && this.checkPassword(password, entity.salt, entity.password)) {
      if (entity.status !== 1) {
        throw new BadRequestError(translate ? translate('用户已被禁用') : '用户已被禁用');
      }
      entity.lastLoginAt = new Date();
      entity.lastLoginIp = ctx?.ip ?? '';
      entity.save();
      return await this.getToken(entity.id);
    } else if (entity) {
      await entity.increment('loginFailure', { by: 1 });
    }
    throw new BadRequestError(translate ? translate('错误的{key}', { args: { key: translate('用户名') + '/' + translate('密码') } }) : '错误的用户名/密码');
  }

  /**
   * 密码加密
   * @param password 密码
   * @returns {salt:密码盐,password:密码密文}
   */
  public entityPassword(password: string, salt?: string) {
    let newSalt: string;
    if (salt) {
      newSalt = salt;
    } else {
      newSalt = randomBytes(16).toString('hex');
    }
    const ciphertext = pbkdf2Sync(password, newSalt, 1000, 32, 'sha3-256').toString('hex');
    return { salt: newSalt, password: ciphertext };
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
}
