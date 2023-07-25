import { ApiProperty, ApiPropertyOptions } from '@meadmin/nest-swagger';
import { applyDecorators } from '@nestjs/common';
import { AttributeOptions } from '@sequelize/core';
import { Attribute } from '@sequelize/core/decorators-legacy';

export function ColumnApi(
  columnOptions: Partial<AttributeOptions> | PropertyDecorator,
  apiPropertyOptions?: ApiPropertyOptions,
): PropertyDecorator {
  let apiOptions: ApiPropertyOptions = {};
  if (typeof columnOptions === 'function') {
    return applyDecorators(
      columnOptions,
      ApiProperty(Object.assign(apiOptions, apiPropertyOptions)),
    );
  }
  apiOptions = {
    description: columnOptions.comment,
  };
  return applyDecorators(
    Attribute(columnOptions),
    ApiProperty(Object.assign(apiOptions, apiPropertyOptions)),
  );
}
