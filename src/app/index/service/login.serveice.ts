import { InjectRepository } from '@/decorators/sequelize.js';
import { User } from '@/entities/user.entity.js';
import { Config, Context, Init, Inject, Singleton } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import dayjs from 'dayjs';

export const tokenPrefix = 'Index:Token:';
export const indexPrefix = 'Index:Index:';
@Singleton()
export class LoginService {
  @InjectRepository(User)
  userRepository: typeof User;

  @Inject()
  cachingFactory: CachingFactory;

  @Config('index.login.expiresIn')
  expiresIn: number; //过期时间ms

  @Config('index.login.secret')
  secret: string; //加密secret

  @Config('index.login.cacheKey')
  cacheKey: string; //token使用的缓存key对应cacheManager.clients

  cache: MidwayCache;

  @Init()
  async init() {
    this.cache = await this.cachingFactory.get(this.cacheKey);
  }

  getUserIdCacheKey(userId: string) {
    return indexPrefix + userId;
  }

  getTokenCacheKey(token: string) {
    return tokenPrefix + token;
  }

  //根据用户id获取token列表
  async getUserTokens(userId: string) {
    let userTokens = ((await this.cache.get(this.getUserIdCacheKey(userId))) ?? []) as Array<{ token: string; expiresInTime: number; expiresInTimeStr: string }>;
    if (userTokens.length) {
      const nowTime = +new Date();
      userTokens = userTokens.filter((item) => item.expiresInTime > +nowTime);
      await this.cache.set(this.getUserIdCacheKey(userId), userTokens);
    }
    return userTokens;
  }

  /**
   * 创建token，极限情况下，会有概率token重复，如果并发过高，可以用redis lua重写这里。
   * @param userId;
   * @returns;
   */
  async createToken(userId: string) {
    const secret = this.secret + new Date();
    const token = pbkdf2Sync(tokenPrefix + userId, secret, 1000, 32, 'md5').toString('hex');
    if (await this.cache.get(this.getTokenCacheKey(token))) {
      return await this.createToken(userId);
    }
    this.cache.set(this.getTokenCacheKey(token), ' ', 2000);
    return token;
  }

  //获取新token
  async getToken(userId: string) {
    const userTokens = await this.getUserTokens(userId);
    const expiresInTime = this.expiresIn + +new Date();
    const token = await this.createToken(userId);
    const tokenInfo = {
      token,
      expiresInTime,
      expiresInTimeStr: dayjs(expiresInTime).format('YYYY-MM-DD HH:mm:ss.SSS'),
    };
    userTokens.push(tokenInfo);
    await this.cache.set(this.getTokenCacheKey(token), userId, this.expiresIn);
    await this.cache.set(this.getUserIdCacheKey(userId), userTokens);
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
  async getUserByToken(token: string) {
    const userId = await this.getIdByToken(token);
    if (userId) {
      return await this.getUserById(userId);
    }
    return null;
  }

  /**
   * 根据管理员信息获取管理员详情
   * @param userId
   * @returns
   */
  async getUserById(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      include: [
        {
          association: 'avatar',
          attributes: { exclude: [] }, //必须设置attributes，否则file的附件属性 url属性返回给前端时没有，已提交[BUG反馈](https://github.com/sequelize/sequelize/issues/18059)
        },
      ],
    });
    return user;
  }

  //移除token
  async removeToken(token: string) {
    const userId = await this.getIdByToken(token);
    if (userId) {
      await this.cache.del(this.getTokenCacheKey(token));
      let userTokens = await this.getUserTokens(userId);
      userTokens = userTokens.filter((item) => item.token !== token);
      await this.cache.set(this.getUserIdCacheKey(userId), userTokens);
    }
  }

  /**
   * 登录
   * @param username 用户名
   * @param password 密码
   * @param ctx      请求上下文
   * @returns
   */
  async login(username, password, ctx?: Context) {
    const entity = await this.userRepository.findOne({ where: { username } });
    if (entity && this.checkPassword(password, entity.salt, entity.password)) {
      if (entity.status !== 1) {
        throw new BadRequestError('用户已被禁用');
      }
      return await this.getToken(entity.id);
    }
    throw new BadRequestError('错误的用户名/密码');
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
