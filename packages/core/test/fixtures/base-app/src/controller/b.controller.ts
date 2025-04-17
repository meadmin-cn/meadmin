import { Controller, Get } from "@midwayjs/core";
import { BaseNoParenterController } from "./baseNoParent.controller.js";


@Controller('b1')
export class BController extends BaseNoParenterController{
  @Get('/info')
  async info(){
    return '单层继承';
  }
}