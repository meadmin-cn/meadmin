import { merge } from '@meadmin/util';
import { CONTROLLER_KEY,getClassMetadata, listModule, Provide, Scope, ScopeEnum } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class RouterService {
    //递归合并@controller装饰器的父类参数到子类
    protected mergeControllerOption(controllerOption, controllerClz: Record<string, unknown>) {
        if (controllerOption.routerOptions && controllerOption.routerOptions.mergeOption !== false) {
            const prototype = Object.getPrototypeOf(controllerClz);
            const parentOption = getClassMetadata(
                CONTROLLER_KEY,
                prototype
            )
            if (parentOption) {
                controllerOption.prefix = (parentOption.prefix+controllerOption.prefix ).replace(/\/\//g, '/');
                controllerOption.routerOptions = merge(parentOption.routerOptions,controllerOption.routerOptions);
                return this.mergeControllerOption(controllerOption, prototype)
            }
            controllerOption.routerOptions.mergeOption = false;//合并过后设置为false
        }
        return controllerOption;
    }

    //批量设置@controller装饰器参数
    public initControllerOption() {
        const controllerModules = listModule(CONTROLLER_KEY);
        for (const module of controllerModules) {
            this.mergeControllerOption(getClassMetadata(
                CONTROLLER_KEY,
                module
            ), module);
        }
    }
}
