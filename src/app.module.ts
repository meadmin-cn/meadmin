import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoreModule } from './core/core';

@Module({
  imports: [CoreModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
