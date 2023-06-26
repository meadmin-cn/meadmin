import { ApiProperty, ApiPropertyOptions } from '@meadmin/nest-swagger';
import { applyDecorators } from '@nestjs/common';
import { Column, ColumnOptions } from 'typeorm';

export function ColumnApi(
  columnOptions: ColumnOptions | PropertyDecorator,
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
    enum: columnOptions.enum,
    enumName: columnOptions.enumName,
  };
  return applyDecorators(
    Column(columnOptions),
    ApiProperty(Object.assign(apiOptions, apiPropertyOptions)),
  );
}
