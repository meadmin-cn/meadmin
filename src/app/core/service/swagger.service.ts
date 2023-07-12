import {
  INestApplication,
  Injectable,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { NestSwaggerModule } from '@meadmin/nest-swagger';
import { Config } from '@/config';

@Injectable()
export class SwaggerService {
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
