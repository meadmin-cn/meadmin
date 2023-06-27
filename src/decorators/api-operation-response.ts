import { ApiErrorRes } from '@/response/api-error.res';
import { ApiPagerRes } from '@/response/api-page.res';
import { ApiSuccessRes } from '@/response/api-success.res';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiOperationOptions,
  ApiResponse,
  getSchemaPath,
} from '@meadmin/nest-swagger';
import { Type, applyDecorators } from '@nestjs/common';

/**
 *
 * @param options
 * @returns
 */
export function ApiOperationResponse<TModel extends Type<any>>(
  options: ApiOperationOptions & {
    successType?: TModel;
    pageType?: TModel;
  },
): MethodDecorator {
  const decorators = [
    ApiExtraModels(ApiSuccessRes, ApiPagerRes, options.successType!),
  ];
  if (options.successType) {
    decorators.push(
      ApiOkResponse({
        description: '请求成功',
        schema: {
          $ref: getSchemaPath(ApiSuccessRes),
          properties: {
            data: {
              $ref: getSchemaPath(options.successType),
            },
          },
        },
      }),
    );
  }
  if (options.pageType) {
    decorators.push(
      ApiOkResponse({
        schema: {
          $ref: getSchemaPath(ApiPagerRes),
          properties: {
            list: {
              type: 'array',
              items: { $ref: getSchemaPath(options.pageType) },
            },
          },
        },
      }),
    );
  }
  // decorators.push(
  //   ApiResponse({ status: 200, description: '请求失败', type: ApiErrorRes }),
  // );
  return applyDecorators(...decorators);
}
