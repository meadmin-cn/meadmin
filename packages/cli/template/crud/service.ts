import { Injectable } from '@nestjs/common';
import { Create__Name__Dto } from './dto/create-__-name__.dto';
import { Update__Name__Dto } from './dto/update-__-name__.dto';
import { __Name__ } from './entities/__-name__.entity.dto';

@Injectable()
export class __Name__Service {
  create(create__Name__Dto: Create__Name__Dto) {
    return __Name__.sa;
  }

  findAll() {
    return `This action returns all __name__`;
  }

  findOne(id: number) {
    return `This action returns a #${id} __name__`;
  }

  update(id: number, update__Name__Dto: Update__Name__Dto) {
    return `This action updates a #${id} __name__`;
  }

  remove(id: number) {
    return `This action removes a #${id} __name__`;
  }
}
