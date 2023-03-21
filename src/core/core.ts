import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import database from '@/config/database';
import config from '@/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
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
    const imports = [] as Exclude<ModuleMetadata['imports'], undefined>;
    const databaseConfigs = database();
    databaseConfigs.forEach((item) => {
      imports.push(
        MikroOrmModule.forRoot(
          Object.assign(databaseConfigs, {
            registerRequestContext: false, // disable automatatic middleware
          }),
        ),
      );
    });
    databaseConfigs.length && imports.push(MikroOrmModule.forMiddleware());
    return {
      module: CoreModule,
      imports,
    };
  }
}
