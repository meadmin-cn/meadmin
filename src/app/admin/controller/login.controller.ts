import { Body, Controller, Inject, Post } from '@midwayjs/core';
import { BaseController } from './base.controller.js';
import { ApiOperationResponse } from '@/decorators/swagger.js';
import { LoginParamDto } from '../dto/loginParam.dto.js';
import { LoginService } from '../service/login.server.js';
import { LoginResultDto } from '../dto/loginResult.dto.js';
import { Context } from '@midwayjs/koa';
import { SystemMenu } from '@/entities/systemMenu.entity.js';
import { LoginInfoResultDto } from '../dto/loginInfoResult.dto.js';

@Controller('login')
export class LoginController extends BaseController {
  @Inject()
  loginService: LoginService;

  @Inject()
  ctx: Context;

  @Post('/login')
  @ApiOperationResponse({
    responseType: LoginResultDto,
    summary: '登录',
  })
  async login(@Body() param: LoginParamDto) {
    return this.success(await this.loginService.login(param.username, param.password));
  }

  @Post('/info')
  @ApiOperationResponse({
    responseType: LoginInfoResultDto,
    summary: '获取管理员详细',
  })
  async info() {
    const admin = await this.loginService.getAdminById(this.ctx.adminInfo.id);
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
      menus,
      btnRules,
    });
  }
}
