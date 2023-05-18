import { Injectable, Logger, LoggerService, SetMetadata } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { DiscoveryService } from './discovery.service';

@Injectable()
export class ControllerService {
  constructor(
    protected readonly discoveryService: DiscoveryService,
    protected readonly reflector: Reflector,
  ) {}
  private readonly InitedController = new Set<new (...args: any[]) => any>();
  private readonly logger: LoggerService = new Logger('MeAdmin', {
    timestamp: true,
  });

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
  init() {
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
