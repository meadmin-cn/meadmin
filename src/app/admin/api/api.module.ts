import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [AdminModule],
})
export class AdminApiModule {}
