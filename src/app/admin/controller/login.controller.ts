import { Body, Controller, Get, Inject, Post, Query } from '@midwayjs/core';
import { BaseController } from './base.controller.js';
import { ApiOperationResponse } from '@/decorators/swagger.js';
import { LoginParamDto } from '../dto/loginParam.dto.js';
import { LoginService } from '../service/login.serveice.js';
import { LoginResultDto } from '../dto/loginResult.dto.js';
import { Context } from '@midwayjs/koa';
import { SystemMenu } from '@/entities/systemMenu.entity.js';
import { LoginInfoResultDto } from '../dto/loginInfoResult.dto.js';
import { CaptchaService } from '@midwayjs/captcha';
import { random } from 'lodash-es';
import { CaptchaResultDto } from '../dto/captchaResult.dto.js';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { LoginCaptchaParamDto } from '../dto/loginCaptchaParam.dto.js';

@Controller('login')
export class LoginController extends BaseController {
  @Inject()
  loginService: LoginService;

  @Inject()
  ctx: Context;

  @Inject()
  captchaService: CaptchaService;

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
    return this.success(await this.loginService.login(param.username, param.password, this.ctx));
  }

  @Post('/info')
  @ApiOperationResponse({
    responseType: LoginInfoResultDto,
    summary: '获取管理员详细',
  })
  async info() {
    const admin = await this.loginService.getAdminById(this.ctx.adminInfo.id, this.ctx);
    const menus = [] as SystemMenu[];
    const btnRules = [] as string[];
    admin?.roleMenus?.forEach((menu) => {
      if (menu.menuType === 3) {
        btnRules.push(menu.rule);
      } else {
        menus.push(menu);
      }
    });
    return this.success({
      info: admin,
      menus:menus.sort((a, b) => b.orderNum - a.orderNum),
      btnRules,
    });
  }
}
