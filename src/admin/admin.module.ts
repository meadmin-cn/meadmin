import { Module } from '@nestjs/common';
import { AdminModule as AdminMModule } from './admin/admin.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AdminMModule, UserModule],
})
export class AdminModule {}
