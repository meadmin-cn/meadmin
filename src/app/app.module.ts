import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [CoreModule.forRoot(), AdminModule],
})
export class AppModule {}
