import { SwaggerConfig } from '@/interfaces/config/swagger';
import {
  INestApplication,
  Injectable,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DiscoveryService } from './discovery.service';
import { NestSwaggerModule } from '@meadmin/nest-swagger';
import { Config } from '@/config';

@Injectable()
export class SwaggerService {
  constructor(
    protected readonly discoveryService: DiscoveryService,
    protected readonly reflector: Reflector,
  ) {}
  private readonly logger: LoggerService = new Logger('MeAdmin', {
    timestamp: true,
  });

  /**
   * 设置swagger documentConfig include module
   *
   * @param   {SwaggerConfig}  config  [config description]
   *
   * @return  {[SwaggerConfig]}                 [return description]
   */
  private async swaggerConfigModule(config: SwaggerConfig) {
    for (const item of config.documentConfig) {
      if (item.deepIncludes === true && item.options?.include?.length) {
        item.options.include = await this.discoveryService.reduceModules(
          item.options.include as (new (...args: any[]) => any)[],
          (module, array) => {
            return [...array, module.metatype];
          },
          [] as (new (...args: any[]) => any)[],
        );
      }
    }
    return config;
  }

  /**
   *初始化swagger
   * @param app
   */
  async init(app: INestApplication) {
    let config = Config.swagger;
    if (config.open) {
      config = await this.swaggerConfigModule(config);
      const finalPath = NestSwaggerModule.setup(
        config.path,
        app,
        config.documentConfig,
        config,
      );
      this.logger.log(`Swagger init {${finalPath}, GET}`);
    }
  }
}
