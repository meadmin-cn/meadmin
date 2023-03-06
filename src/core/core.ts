import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import database from '@/config/database';
import config from '@/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,
    }),
  ],
})
export class CoreModule {
  static forRoot(): DynamicModule {
    console.log('configService', new ConfigService(), database());
    // imports.push()
    return {
      module: CoreModule,
    };
  }
}
