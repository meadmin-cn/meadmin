import { OnAppCreated } from '@/interfaces/hooks/on-app.created.interface';
import {
  INestApplication,
  Injectable,
  Logger,
  LoggerService,
  SetMetadata,
} from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import swaggerConfig from '@/config/swagger';
import { NestSwaggerModule } from '@meadmin/nest-swagger';
import { Reflector } from '@nestjs/core';
import { PATH_METADATA } from '@nestjs/common/constants';
import { SwaggerConfig } from '@/interfaces/config/swagger.interface';

@Injectable()
export class AppService implements OnAppCreated {
  constructor(
    protected readonly discoveryService: DiscoveryService,
    protected readonly reflector: Reflector,
  ) {}
  private readonly InitedController = new Set<new (...args: any[]) => any>();
  private readonly logger: LoggerService = new Logger('MeAdminInit', {
    timestamp: true,
  });
  async onAppCreated(app: INestApplication) {
    this.controllerInit();
    await this.swaggerInit(app);
  }

  /**
   * controller路径解析
   * @param path
   * @returns
   */
  private resolverPaths(path?: string | string[]) {
    let paths: string[] = [];
    if (path) {
      if (typeof path === 'string') {
        paths = [path.startsWith('/') ? path : `/${path}`];
      } else {
        paths = path.map((item) => (item.startsWith('/') ? item : `/${item}`));
      }
    }
    return paths;
  }

  /**
   * 初始化controller
   */
  controllerInit() {
    const controllerInit = (
      controllerClass: new (...args: any[]) => any,
    ): string[] => {
      if (this.InitedController.has(controllerClass)) {
        return (
          this.reflector.get<string[]>(PATH_METADATA, controllerClass) ?? []
        );
      }
      let paths: string[] = [];

      if (Object.getPrototypeOf(controllerClass) === Function.prototype) {
        paths = this.resolverPaths(
          this.reflector.get<string | string[] | undefined>(
            PATH_METADATA,
            controllerClass,
          ),
        );
      } else {
        const parentPaths = controllerInit(
          Object.getPrototypeOf(controllerClass),
        );
        const origionPaths = this.resolverPaths(
          this.reflector.get<string | string[] | undefined>(
            PATH_METADATA,
            controllerClass,
          ),
        );
        parentPaths.forEach((item) => {
          origionPaths.forEach((v) => {
            paths.push((item + v).replace(/\/\//g, '/'));
          });
        });
        if (!paths.length) {
          paths = parentPaths.length ? [...parentPaths] : [...origionPaths];
        }
      }
      paths.length && SetMetadata(PATH_METADATA, paths)(controllerClass);
      this.InitedController.add(controllerClass);
      return paths;
    };
    this.discoveryService.getControllers().forEach((controller) => {
      controllerInit(controller.metatype as new (...args: any[]) => any);
    });
    this.logger.log('Controller init');
  }

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
            array.push(module.metatype);
            return array;
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
  async swaggerInit(app: INestApplication) {
    let config = await swaggerConfig();
    if (config.open) {
      config = await this.swaggerConfigModule(config);
      const finalPath = NestSwaggerModule.setup(
        config.path,
        app,
        config.documentConfig,
        config,
      );
      this.logger.log('Swagger init url:' + finalPath);
    }
  }
}
