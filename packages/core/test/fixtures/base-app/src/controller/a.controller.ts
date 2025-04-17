import { Controller, Get } from "@midwayjs/core";
import { Base1Controller } from "./base1.controller.js";


@Controller('a3')
export class A3Controller extends Base1Controller{
  @Get('/info')
  async info(){
    return '多层继承';
  }
}