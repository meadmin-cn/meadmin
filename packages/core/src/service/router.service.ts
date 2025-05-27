/**
 * 根据 controller 继承关系 递归合成Controller装饰器的path
 * 从第一个prefix以/开头的祖级开始合并controller的prefix和routerOptions，如果prefix 以/开头，则不合并prefix和routerOptions。
 */
import { merge } from '../util/index.js';
import {
  CONTROLLER_KEY,
  ControllerOption,
  getClassMetadata,
  listModule,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class RouterService {
  protected routerOptionsMerged = new Map<ControllerOption, boolean>();

  //递归合并@Controller装饰器的父类参数到子类
  protected mergeControllerOption(
    controllerOption: ControllerOption,
    controllerClz: Record<string, unknown>
  ) {
    if (this.routerOptionsMerged.get(controllerOption) !== true) {
      const prototype = Object.getPrototypeOf(controllerClz);
      const parentOption = getClassMetadata(CONTROLLER_KEY, prototype);
      if (parentOption) {
        if (!controllerOption.prefix.startsWith('/')) {
          controllerOption.prefix = (
            parentOption.prefix +
            '/' +
            controllerOption.prefix
          ).replace(/\/\//g, '/');
          if (controllerOption.routerOptions && parentOption.routerOptions) {
            controllerOption.routerOptions = merge(
              parentOption.routerOptions,
              controllerOption.routerOptions
            );
          }
        }
        return this.mergeControllerOption(controllerOption, prototype);
      }
      this.routerOptionsMerged.set(controllerOption, true);
    }
    return controllerOption;
  }

  //批量设置@controller装饰器参数
  public initControllerOption() {
    const controllerModules = listModule(CONTROLLER_KEY);
    for (const module of controllerModules) {
      this.mergeControllerOption(
        getClassMetadata(CONTROLLER_KEY, module),
        module
      );
    }
  }
}
