import { ApiPageRes, PageRes } from '@/response/api-page.res';
import { ApiSuccessRes } from '@/response/api-success.res';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiOperationOptions,
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
    successType?: TModel | false;
    pageType?: TModel;
  },
): MethodDecorator {
  const decorators = [ApiExtraModels(ApiSuccessRes, ApiPageRes, PageRes)];
  if (options.pageType) {
    decorators.push(ApiExtraModels(options.pageType));
    decorators.push(
      ApiOkResponse({
        schema: {
          $ref: getSchemaPath(ApiPageRes),
          description: '数据code非200时值为undefined',
          properties: {
            data: {
              $ref: getSchemaPath(PageRes),
              properties: {
                list: {
                  type: 'array',
                  items: { $ref: getSchemaPath(options.pageType) },
                  description: '分页数据',
                },
              },
            },
          },
        },
      }),
    );
  } else if (options.successType) {
    decorators.push(ApiExtraModels(options.successType));
    decorators.push(
      ApiOkResponse({
        description: '请求成功',
        schema: {
          $ref: getSchemaPath(ApiSuccessRes),
          properties: {
            data: {
              $ref: getSchemaPath(options.successType),
              description: '数据code非200时值为undefined',
            },
          },
        },
      }),
    );
  } else if (options.successType !== false) {
    decorators.push(
      ApiOkResponse({
        description: '请求成功',
        schema: {
          $ref: getSchemaPath(ApiSuccessRes),
        },
      }),
    );
  }
  return applyDecorators(
    ...decorators,
    ApiOperation(
      Object.assign(options, { successType: undefined, pageType: undefined }),
    ),
  );
}
