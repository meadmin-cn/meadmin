import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { InjectionToken } from '@nestjs/common';
import { iterate } from 'iterare';

/**
 * Returns the instances which are transient
 * @param instances The instances which should be checked whether they are transient
 */
export function getTransientInstances(
  instances: [InjectionToken, InstanceWrapper][],
): InstanceWrapper[] {
  return iterate(instances)
    .filter(([, wrapper]) => wrapper.isDependencyTreeStatic())
    .map(([, wrapper]) => wrapper.getStaticTransientInstances())
    .flatten()
    .filter((item) => !!item)
    .map(({ instance }: any) => instance)
    .toArray() as InstanceWrapper[];
}

/**
 * Returns the instances which are not transient
 * @param instances The instances which should be checked whether they are transient
 */
export function getNonTransientInstances(
  instances: [InjectionToken, InstanceWrapper][],
): InstanceWrapper[] {
  return iterate(instances)
    .filter(
      ([, wrapper]) => wrapper.isDependencyTreeStatic() && !wrapper.isTransient,
    )
    .map(([, { instance }]) => instance)
    .toArray() as InstanceWrapper[];
}
