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

  async swaggerInit(app: INestApplication) {
    const config = swaggerConfig();
    if (config.open) {
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
      const finalPath = NestSwaggerModule.setup(
        config.path,
        app,
        config.documentConfig,
        config,
      );
      this.logger.log('Swagger init url:' + finalPath);
    }
  }

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
}
