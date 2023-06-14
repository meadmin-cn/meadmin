import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminService {
  create(createAdminDto: CreateAdminDto) {
    console.log(createAdminDto);
    return Admin.save(createAdminDto);
  }

  findAll() {
    return Admin.find();
  }

  findOne(id: number) {
    return Admin.findOneBy({ id });
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return Admin.update(id, updateAdminDto);
  }

  remove(id: number) {
    return Admin.delete(id);
  }
}
