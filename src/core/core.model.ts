import { DynamicModule, Global, Module, ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import database from '@/config/database';
import config from '@/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from './service/response.service';
import { ApiController } from './controller/api.controller';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,
    }),
  ],
  providers: [ResponseService],
  exports: [ResponseService],
})
export class CoreModule {
  static forRoot(): DynamicModule {
    const imports = [] as Exclude<ModuleMetadata['imports'], undefined>;
    const databaseConfigs = database();
    databaseConfigs.forEach((item) => {
      imports.push(TypeOrmModule.forRoot(item));
    });
    return {
      module: CoreModule,
      imports,
    };
  }
}
