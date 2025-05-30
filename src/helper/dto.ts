import {
  getClassExtendedMetadata,
  INJECT_CUSTOM_PROPERTY,
  saveClassMetadata,
} from '@midwayjs/core';
import { Dto, OmitDto, PickDto } from '@midwayjs/validate';

import { RULES_KEY } from '@midwayjs/validate/dist/constants.js';
import { cloneDeep } from 'lodash-es';
import { DECORATORS } from '@midwayjs/swagger/dist/constants.js';

/**
 * PickDto 用于从现有的 DTO 中获取一些属性，变成新的 DTO，
 * 兼容swagger和validate
 * @param dto
 * @param keys
 * @returns
 */
export function PickDtoType<T, K extends Array<keyof T>>(
  dto: Dto<T>,
  keys: K
): Dto<Pick<T, K[number]>> {
  const pickedDto = PickDto(dto, keys);
  const fatherProperties = getClassExtendedMetadata(
    INJECT_CUSTOM_PROPERTY,
    dto
  );
  const pickedProperties: any = {};
  for (const key of keys) {
    if (
      fatherProperties[key] &&
      fatherProperties[key].key === DECORATORS.API_MODEL_PROPERTIES
    ) {
      pickedProperties[key] = fatherProperties[key];
    }
  }
  saveClassMetadata(INJECT_CUSTOM_PROPERTY, pickedProperties, pickedDto);
  return pickedDto;
}

/**
 * OmitDto 用于将其中某些属性剔除，变成新的 DTO
 * 兼容swagger和validate
 * @param dto
 * @param keys
 * @returns
 */
export function OmitDtoType<T, K extends Array<keyof T>>(
  dto: Dto<T>,
  keys: K
): Dto<Omit<T, K[number]>> {
  const pickedDto = OmitDto(dto, keys);
  const fatherProperties = getClassExtendedMetadata(
    INJECT_CUSTOM_PROPERTY,
    dto
  );
  const pickedProperties: any = {};
  for (const key of Object.keys(fatherProperties)) {
    if (
      fatherProperties[key].key === DECORATORS.API_MODEL_PROPERTIES &&
      !keys.includes(key as any)
    ) {
      pickedProperties[key] = fatherProperties[key];
    }
  }
  saveClassMetadata(INJECT_CUSTOM_PROPERTY, pickedProperties, pickedDto);
  return pickedDto;
}

/**
 * 将属性设置为可选
 * 兼容swagger和validate
 * @param dto
 * @param keys 传入属性数组则只将对应的属性设置为可选。否则将所有属性设置为可选
 * @returns
 */
export function PartialType<T, K extends Array<keyof T>>(
  dto: Dto<T>,
  keys?: K
): K extends unknown
  ? Dto<Partial<T>>
  : Dto<
      Omit<T, K[number]> & {
        [P in K[number]]?: T[P];
      }
    > {
  //重新声明校验规则并设置为可选
  const partitalDto: any = function () {};
  partitalDto.prototype = dto.prototype;
  const fatherRule = getClassExtendedMetadata(RULES_KEY, dto);
  const partitalRule: any = {};
  for (const key of Object.keys(fatherRule)) {
    if (fatherRule[key]) {
      partitalRule[key] = cloneDeep(fatherRule[key]);
      if (!keys || keys.includes(key as any)) {
        partitalRule[key] = partitalRule[key].optional();
        if (partitalRule[key].type === 'string') {
          partitalRule[key] = partitalRule[key].empty('');
        }
      }
    }
  }
  saveClassMetadata(RULES_KEY, partitalRule, partitalDto);
  //设置swagger properties定义
  const fatherProperties = getClassExtendedMetadata(
    INJECT_CUSTOM_PROPERTY,
    dto
  );
  const partitalProperties: any = {};
  for (const key of Object.keys(fatherProperties)) {
    if (fatherProperties[key].key === DECORATORS.API_MODEL_PROPERTIES) {
      partitalProperties[key] = cloneDeep(fatherProperties[key]);
      if (!keys || keys.includes(key as any)) {
        partitalProperties[key].metadata.required = false;
      }
    }
  }
  saveClassMetadata(INJECT_CUSTOM_PROPERTY, partitalProperties, partitalDto);
  return partitalDto;
}

/**
 * 两种类型合并为一种新类型,结合了两种类型的所有属性
 * 兼容swagger和validate
 * @param dto1
 * @param dto2
 * @returns
 */
export function IntersectionType<T1, T2>(
  dto1: Dto<T1>,
  dto2: Dto<T2>
): Dto<T1 & T2> {
  //重新声明校验规则
  const dto: any = function () {};
  const fatherRule1 = getClassExtendedMetadata(RULES_KEY, dto1);
  const fatherRule2 = getClassExtendedMetadata(RULES_KEY, dto2);
  const rule = Object.assign({}, fatherRule1, fatherRule2);
  saveClassMetadata(RULES_KEY, rule, dto);
  //设置swagger properties定义
  const fatherProperties1 = getClassExtendedMetadata(
    INJECT_CUSTOM_PROPERTY,
    dto1
  );
  const fatherProperties2 = getClassExtendedMetadata(
    INJECT_CUSTOM_PROPERTY,
    dto2
  );
  const properties: any = {};
  for (const key of Object.keys(fatherProperties1)) {
    if (fatherProperties1[key].key === DECORATORS.API_MODEL_PROPERTIES) {
      properties[key] = fatherProperties1[key];
    }
  }
  for (const key of Object.keys(fatherProperties2)) {
    if (fatherProperties2[key].key === DECORATORS.API_MODEL_PROPERTIES) {
      properties[key] = fatherProperties2[key];
    }
  }
  saveClassMetadata(INJECT_CUSTOM_PROPERTY, properties, dto);
  return dto;
}
