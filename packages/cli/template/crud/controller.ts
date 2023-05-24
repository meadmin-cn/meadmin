import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { __Name__Service } from './__-name__.service';
import { Create__Name__Dto } from './dto/create-__-name__.dto';
import { Update__Name__Dto } from './dto/update-__-name__.dto';

@Controller('__name__')
export class __Name__Controller {
  constructor(private readonly __name__Service: __Name__Service) {}

  @Post()
  create(@Body() create__Name__Dto: Create__Name__Dto) {
    return this.__name__Service.create(create__Name__Dto);
  }

  @Get()
  findAll() {
    return this.__name__Service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.__name__Service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() update__Name__Dto: Update__Name__Dto) {
    return this.__name__Service.update(+id, update__Name__Dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.__name__Service.remove(+id);
  }
}
