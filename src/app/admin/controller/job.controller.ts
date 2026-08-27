import { AdminPermission, ApiOperationResponse } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { Job } from '../../../entities/job.entity.js';
import { JobCreateDto } from '../dto/jobCreate.dto.js';
import { JobQueryDto } from '../dto/jobQuery.dto.js';
import { JobStartDto } from '../dto/jobStart.dto.js';
import { JobService } from '../service/job.service.js';
import { BaseController } from './base.controller.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，方便传参，除详情外统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('job')
export class JobController extends BaseController {
  @Inject()
  jobService: JobService;

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/add')
  @ApiOperationResponse({
    responseType: Job,
    summary: '添加任务信息',
  })
  @AdminPermission('job_add')
  async add(@Body() createDto: JobCreateDto) {
    return this.success(await this.jobService.create(createDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/')
  @ApiOperationResponse({
    responsePage: Job,
    summary: '获取任务列表',
  })
  @AdminPermission('job_list')
  async list(@Body() queryDto: JobQueryDto) {
    return this.success(await this.jobService.list(queryDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/info/:id')
  @ApiOperationResponse({
    responseType: Job,
    summary: '根据id获取任务详情',
  })
  @AdminPermission('job_info')
  async findOne(@Param('id') id: string) {
    const entity = await this.jobService.findOne(id);
    return this.success(entity);
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/start/:id')
  @ApiOperationResponse({
    responseType: Job,
    summary: '启动任务',
  })
  @AdminPermission('job_start')
  async start(@Param('id') id: string, @Body() startDto: JobStartDto) {
    return this.success(await this.jobService.start(id, startDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/stop/:id')
  @ApiOperationResponse({
    responseType: Job,
    summary: '停止任务',
  })
  @AdminPermission('job_stop')
  async stop(@Param('id') id: string) {
    return this.success(await this.jobService.stop(id));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/del/:id')
  @ApiOperationResponse({
    summary: '根据id删除任务信息',
  })
  @AdminPermission('job_del')
  async delete(@Param('id') id: string) {
    await this.jobService.remove(id);
    return this.success();
  }
}
