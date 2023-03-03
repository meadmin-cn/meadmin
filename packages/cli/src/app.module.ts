import { Module } from '@nestjs/common';
import { AutoImport } from './command/autoImport';

@Module({
  providers: [AutoImport],
})
export class AppModule {}
