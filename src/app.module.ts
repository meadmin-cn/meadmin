import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoreModule } from './core/core';
import { AdminModule } from './admin/admin.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [CoreModule.forRoot(), AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
