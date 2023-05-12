import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { InstanceToken } from '@nestjs/core/injector/module';
import { iterate } from 'iterare';

/**
 * Returns the instances which are transient
 * @param instances The instances which should be checked whether they are transient
 */
export function getTransientInstances(
  instances: [InstanceToken, InstanceWrapper][],
): InstanceWrapper[] {
  return (
    iterate(instances)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, wrapper]) => wrapper.isDependencyTreeStatic())
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(([_, wrapper]) => wrapper.getStaticTransientInstances())
      .flatten()
      .filter((item) => !!item)
      .map(({ instance }: any) => instance)
      .toArray() as InstanceWrapper[]
  );
}

/**
 * Returns the instances which are not transient
 * @param instances The instances which should be checked whether they are transient
 */
export function getNonTransientInstances(
  instances: [InstanceToken, InstanceWrapper][],
): InstanceWrapper[] {
  return iterate(instances)
    .filter(
      ([, wrapper]) => wrapper.isDependencyTreeStatic() && !wrapper.isTransient,
    )
    .map(([, { instance }]) => instance)
    .toArray() as InstanceWrapper[];
}
