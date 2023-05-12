import { Injectable } from '@nestjs/common';
import {
  DiscoveryOptions,
  DiscoveryService as NestDiscoveryService,
} from '@nestjs/core';
import { Module } from '@nestjs/core/injector/module';
@Injectable()
export class DiscoveryService extends NestDiscoveryService {
  public getModules(options?: DiscoveryOptions) {
    return super.getModules(options);
  }

  /**
   * 为module递归调用 callbackfn
   * @param inclides
   * @param callbackfn
   * @param initialValue
   * @returns
   */
  public async reduceModules<T>(
    inclides: ((new (...args: any[]) => any) | Module)[],
    callbackfn: (module: Module, initialValue: T) => Promise<T> | T,
    initialValue: T,
  ) {
    const tempModules = new Set<Module>();
    const reduceModules = async (
      inclides: ((new (...args: any[]) => any) | Module)[],
      callbackfn: (module: Module, initialValue: T) => Promise<T> | T,
      initialValue: T,
    ) => {
      let value: T = initialValue;
      for (const item of inclides) {
        let module: Module;
        if (item instanceof Module) {
          module = item;
        } else {
          module = this.getModules({ include: [item] })?.[0];
        }
        if (module && !tempModules.has(module)) {
          tempModules.add(module);
          value = await callbackfn(module, value);
          for (const item of module.imports) {
            value = await reduceModules([item], callbackfn, value);
          }
        }
      }
      return value;
    };
    return await reduceModules(inclides, callbackfn, initialValue);
  }
}
