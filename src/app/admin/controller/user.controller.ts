import { Body, Controller, Post } from "@midwayjs/core";
import { UserAddDto } from "../dto/userAdd.dto.js";
import { BaseController } from "./base.controller.js";

@Controller('user')
export class UserController extends BaseController {

    //接口方法必须加async 方法的接口装饰器值必须/开头
    @Post('/add')
    async add(@Body() user: UserAddDto){
        return this.resposes.success(user)
    }
}