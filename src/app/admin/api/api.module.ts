import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    AdminModule,
    RouterModule.register([
      {
        path: 'admin/api',
        module: AdminModule,
      },
    ]),
  ],
})
export class AdminApiModule {}
