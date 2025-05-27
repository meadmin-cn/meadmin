import {
  getClassExtendedMetadata,
  INJECT_CUSTOM_PROPERTY,
  saveClassMetadata,
} from '@midwayjs/core';
import { Dto, OmitDto, PickDto } from '@midwayjs/validate';

/**
 * 兼容swagger和validate
 * @param dto
 * @param keys
 * @returns
 */
export function PickDtoType<T, K extends keyof T>(
  dto: Dto<T>,
  keys: K[]
): Dto<Pick<T, (typeof keys)[number]>> {
  const pickedDto = PickDto(dto, keys);
  const fatherProperties = getClassExtendedMetadata(
    INJECT_CUSTOM_PROPERTY,
    dto
  );
  const pickedProperties: any = {};
  for (const key of keys) {
    if (fatherProperties[key]) {
      pickedProperties[key] = fatherProperties[key];
    }
  }
  //将会保留所有类型的自定义属性元数据，不光是swagger
  saveClassMetadata(INJECT_CUSTOM_PROPERTY, pickedProperties, pickedDto);
  return pickedDto;
}

/**
 * 兼容swagger和validate
 * @param dto
 * @param keys
 * @returns
 */
export function OmitDtoType<T, K extends keyof T>(dto: Dto<T>, keys: K[]) {
  const pickedDto = OmitDto(dto, keys);
  const fatherProperties = getClassExtendedMetadata(
    INJECT_CUSTOM_PROPERTY,
    dto
  );
  const pickedProperties: any = Object.assign({}, fatherProperties);
  for (const key of keys) {
    delete pickedProperties[key];
  }
  //将会保留所有类型的自定义属性元数据，不光是swagger
  saveClassMetadata(INJECT_CUSTOM_PROPERTY, pickedProperties, pickedDto);
  return pickedDto;
}
