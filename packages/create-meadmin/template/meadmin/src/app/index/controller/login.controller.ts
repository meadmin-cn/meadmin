import { ApiOperationResponse } from '@/decorators/swagger.js';
import { User } from '@/entities/user.entity.js';
import { CaptchaService } from '@midwayjs/captcha';
import { Body, Controller, Get, Inject, Post, Query } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { Context } from '@midwayjs/koa';
import { random } from 'lodash-es';
import { CaptchaResultDto } from '../dto/captchaResult.dto.js';
import { LoginCaptchaParamDto } from '../dto/loginCaptchaParam.dto.js';
import { LoginParamDto } from '../dto/loginParam.dto.js';
import { LoginResultDto } from '../dto/loginResult.dto.js';
import { UserCreateDto } from '../dto/userCreate.dto.js';
import { LoginService } from '../service/login.serveice.js';
import { UserService } from '../service/user.service.js';
import { BaseController } from './base.controller.js';

@Controller('login')
export class LoginController extends BaseController {
  @Inject()
  loginService: LoginService;

  @Inject()
  ctx: Context;

  @Inject()
  captchaService: CaptchaService;

  @Inject()
  userService: UserService;

  @Get('/captcha')
  @ApiOperationResponse({
    responseType: CaptchaResultDto,
    summary: '获取验证码',
  })
  async captcha(@Query() query: LoginCaptchaParamDto) {
    const noise = random(0, 20);
    //获取计算验证码
    const { id, imageBase64 } = await this.captchaService.formula(
      { noise, width: query.width, height: query.height },
      {
        expirationTime: 600, //过期时间，单位s
      },
    );
    return this.success({
      id, // 验证码 id
      imageBase64, // 验证码 SVG 图片的 base64 数据，可以直接放入前端的 img 标签内
    });
  }

  @Post('/login')
  @ApiOperationResponse({
    responseType: LoginResultDto,
    summary: '登录',
  })
  async login(@Body() param: LoginParamDto) {
    if (!(await this.captchaService.check(param.captchaId, param.captcha))) {
      throw new BadRequestError('验证码错误或已过期');
    }
    return this.success(await this.loginService.login(param.username, param.password));
  }

  @Post('/info')
  @ApiOperationResponse({
    responseType: User,
    summary: '获取用户详细信息',
  })
  async info() {
    return this.success(this.ctx.userInfo);
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/register')
  @ApiOperationResponse({
    responseType: User,
    summary: '注册',
  })
  async register(@Body() createDto: UserCreateDto) {
    return this.success(await this.userService.create(createDto));
  }
}
