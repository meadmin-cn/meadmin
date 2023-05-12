import {
  getNonTransientInstances,
  getTransientInstances,
} from '@/helpers/transient-instances';
import { OnAppCreated } from '@/interfaces/hooks/on-app.created.interface';
import { INestApplication, OnModuleInit } from '@nestjs/common';
import { isFunction, isNil } from '@nestjs/common/utils/shared.utils';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { iterate } from 'iterare';

/**
 * Returns true or false if the given instance has a `onModuleInit` function
 *
 * @param instance The instance which should be checked
 */
function hasOnAppCreatedHook(instance: unknown): instance is OnModuleInit {
  return isFunction((instance as OnAppCreated).onAppCreated);
}

/**
 * Calls the given instances
 */
function callOperator<T extends INestApplication = INestApplication>(
  app: T,
  instances: InstanceWrapper[],
): Promise<any>[] {
  return iterate(instances)
    .filter((instance) => !isNil(instance))
    .filter(hasOnAppCreatedHook)
    .map(async (instance) =>
      (instance as unknown as OnAppCreated).onAppCreated(app),
    )
    .toArray();
}

/**
 * Calls the `onModuleInit` function on the module and its children
 * (providers / controllers).
 *
 * @param module The module which will be initialized
 */
export async function callAppCreatedHook<
  T extends INestApplication = INestApplication,
>(app: T, module: Module): Promise<void> {
  const providers = module.getNonAliasProviders();
  // Module (class) instance is the first element of the providers array
  // Lifecycle hook has to be called once all classes are properly initialized
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion
  const [_, moduleClassHost] = providers.shift()!;
  const instances = [
    ...module.controllers,
    ...providers,
    ...module.injectables,
    ...module.middlewares,
  ];

  const nonTransientInstances = getNonTransientInstances(instances);
  await Promise.all(callOperator(app, nonTransientInstances));

  const transientInstances = getTransientInstances(instances);
  await Promise.all(callOperator(app, transientInstances));

  // Call the instance itself
  const moduleClassInstance = moduleClassHost.instance;
  if (
    moduleClassInstance &&
    hasOnAppCreatedHook(moduleClassInstance) &&
    moduleClassHost.isDependencyTreeStatic()
  ) {
    await (moduleClassInstance as unknown as OnAppCreated).onAppCreated(app);
  }
}
