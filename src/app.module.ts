import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core';
import { AdminCoreModule } from './admin/core.module';

@Module({
  imports: [CoreModule.forRoot(), AdminCoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
