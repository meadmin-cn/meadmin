import { AdminPermission, ApiOperationResponse } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { ExampleDemo } from '../../../../entities/exampleDemo.entity.js';
import { ExampleDemoCreateDto } from '../../dto/example/demoCreate.dto.js';
import { ExampleDemoQueryDto } from '../../dto/example/demoQuery.dto.js';
import { ExampleDemoUpdateDto } from '../../dto/example/demoUpdate.dto.js';
import { ExampleDemoService } from '../../service/example/demo.service.js';
import { BaseController } from '../base.controller.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，方便传参，除详情外统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('example/demo')
export class ExampleDemoController extends BaseController {
  @Inject()
  exampleDemoService: ExampleDemoService;

  //查询belongsTo关联模型user用户
  //获取用户信息
  @Post('/getUser')
  @ApiOperationResponse({
    responseType: ExampleDemo,
    summary: '查询用户信息',
  })
  @AdminPermission('example_demo_list')
  async getUser(@Body('id') id: string, @Body('username') username: string, @Body('page') page = 1, @Body('pageSize') pageSize = 10) {
    return this.success(await this.exampleDemoService.getUser(page, pageSize, id, username));
  }

  //查询belongsToMany关联模型books示例_书籍
  //获取示例_书籍信息
  @Post('/getExampleBook')
  @ApiOperationResponse({
    responseType: ExampleDemo,
    summary: '查询示例_书籍信息',
  })
  @AdminPermission('example_demo_list')
  async getExampleBook(@Body('id') id: string, @Body('name') name: string, @Body('page') page = 1, @Body('pageSize') pageSize = 10) {
    return this.success(await this.exampleDemoService.getExampleBook(page, pageSize, id, name));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/add')
  @ApiOperationResponse({
    responseType: ExampleDemo,
    summary: '添加示例_Demo信息',
  })
  @AdminPermission('example_demo_add')
  async add(@Body() createDto: ExampleDemoCreateDto) {
    return this.success(await this.exampleDemoService.create(createDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/')
  @ApiOperationResponse({
    responsePage: ExampleDemo,
    summary: '获取示例_Demo列表',
  })
  @AdminPermission('example_demo_list')
  async list(@Body() queryDto: ExampleDemoQueryDto) {
    return this.success(await this.exampleDemoService.list(queryDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/info/:id')
  @ApiOperationResponse({
    responseType: ExampleDemo,
    summary: '根据id获取示例_Demo详情',
  })
  @AdminPermission('example_demo_edit')
  async findOne(@Param('id') id: string) {
    const entity = await this.exampleDemoService.findOne(id);
    return this.success(entity);
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/up/:id')
  @ApiOperationResponse({
    responseType: ExampleDemo,
    summary: '根据id更新示例_Demo信息',
  })
  @AdminPermission('example_demo_info')
  async update(@Param('id') id: string, @Body() updateDto: ExampleDemoUpdateDto) {
    return this.success(await this.exampleDemoService.update(id, updateDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/del/:id')
  @ApiOperationResponse({
    summary: '根据id删除示例_Demo信息',
  })
  @AdminPermission('example_demo_del')
  async delete(@Param('id') id: string) {
    await this.exampleDemoService.remove(id);
    return this.success();
  }
}
