import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from './core/core';

@Module({
  imports: [CommonModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
