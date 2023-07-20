import {
  DynamicModule,
  Global,
  Logger,
  Module,
  ModuleMetadata,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config, { Config } from '@/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from './service/response.service';
import { AppService } from './service/app.service';
import { DiscoveryService } from './service/discovery.service';
import { ControllerService } from './service/controller.service';
import { SwaggerService } from './service/swagger.service';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './exception/filter/all-exception.filter';
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,
      expandVariables: true,
      envFilePath: ['.env.' + process.env.NODE_ENV, '.env'],
    }),
  ],
  providers: [
    ResponseService,
    AppService,
    DiscoveryService,
    ControllerService,
    SwaggerService,
    Logger,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [ResponseService, Logger],
})
export class CoreModule {
  static forRoot(): DynamicModule {
    const imports = [] as Exclude<ModuleMetadata['imports'], undefined>;
    const databaseConfigs = Config.database;
    databaseConfigs.forEach((item) => {
      imports.push(TypeOrmModule.forRoot(item));
    });
    return {
      module: CoreModule,
      imports,
    };
  }
}
