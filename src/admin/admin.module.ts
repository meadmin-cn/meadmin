import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule as AdminMModule } from './admin/admin.module';
import { Admin } from './admin/entities/admin.entity';

@Module({
  imports: [AdminMModule],
})
export class AdminModule {}
