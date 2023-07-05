import { SwaggerConfig } from '@/interfaces/config/swagger';
import {
  INestApplication,
  Injectable,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DiscoveryService } from './discovery.service';
import {
  DocumentBuilder,
  NestSwaggerModule,
  SwaggerModule,
} from '@meadmin/nest-swagger';
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
   *初始化swagger
   * @param app
   */
  async init(app: INestApplication) {
    const config = Config.swagger;
    if (config.open) {
      const finalPath = NestSwaggerModule.setup(
        config.path,
        app,
        config.swaggers,
        config.useGlobalPrefix,
      );
      this.logger.log(`Swagger init {${finalPath}, GET}`);
    }
  }
}
