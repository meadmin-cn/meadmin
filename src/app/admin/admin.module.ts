import { Module } from '@nestjs/common';
import { AdminApiModule } from './api/api.module';

@Module({
  imports: [AdminApiModule],
})
export class AdminModule {}
