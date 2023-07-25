import {
  DynamicModule,
  Global,
  Logger,
  Module,
  ModuleMetadata,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config, { Config } from '@/config';
import { ResponseService } from './service/response.service';
import { AppService } from './service/app.service';
import { DiscoveryService } from './service/discovery.service';
import { ControllerService } from './service/controller.service';
import { SwaggerService } from './service/swagger.service';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './exception/filter/all-exception.filter';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import Sequelize from '@sequelize/core';
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,
      expandVariables: true,
      envFilePath: ['.env.' + process.env.NODE_ENV, '.env'],
    }),
    // CacheModule.register<Exclude<Parameters<typeof redisStore>[0], undefined>>({
    //   store: redisStore,
    //   // Store-specific configuration:
    //   host: '127.0.0.1',
    //   port: 6379,
    // }),
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
  static async forRoot(): Promise<DynamicModule> {
    const imports = [] as Exclude<ModuleMetadata['imports'], undefined>;
    const databaseConfigs = await Config.database;
    databaseConfigs.forEach((item) => {
      console.log(item.models);
      new Sequelize(item);
    });
    return {
      module: CoreModule,
      imports,
    };
  }
}
