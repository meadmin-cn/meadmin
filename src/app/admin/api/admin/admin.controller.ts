import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminApiController } from '../api.controller';
import { ApiTags } from '@meadmin/nest-swagger';
import { ApiOperationResponse } from '@/decorators/api-operation-response';
import { Admin } from './entities/admin.entity';
import { QueryAdminDto } from './dto/query-admin.dto';

@ApiTags('管理员')
@Controller('admin')
export class AdminController extends AdminApiController {
  constructor(private adminService: AdminService) {
    super();
  }

  @ApiOperationResponse({ summary: '添加管理员', successType: Admin })
  @Post()
  async create(@Body() createAdminDto: CreateAdminDto) {
    return this.response.success(
      await this.adminService.create(createAdminDto),
    );
  }

  @ApiOperationResponse({
    summary: '获取所有管理员',
    pageType: Admin,
  })
  @Get()
  async findAll(@Query() queryAdminDto: QueryAdminDto) {
    return this.response.success({
      list: await this.adminService.findAll(queryAdminDto),
      total: await this.adminService.count(queryAdminDto),
    });
  }

  @ApiOperationResponse({
    summary: '根据id获取对应管理员信息',
    successType: Admin,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.response.success(await this.adminService.findOne(+id));
  }

  @ApiOperationResponse({ summary: '跟据id更新管理员信息' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @ApiOperationResponse({ summary: '跟据id删除管理员信息' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
