import { ApiPageRes, PageRes } from '@/response/apiPage.res.js';
import { ApiSuccessRes } from '@/response/apiSuccess.res.js';
import { createCustomMethodDecorator } from '@midwayjs/core';
import {
  ApiExtraModel,
  ApiOperation,
  ApiOperationOptions,
  ApiResponse,
  getSchemaPath,
  Type,
} from '@midwayjs/swagger';

// 装饰器内部的唯一 id
export const API_OPERATIN_RESONSE_KEY =
  'decorator:swagger_api_operation_respose';
/**
 * swagger返回装饰器
 * @param options
 * @returns
 */
export function ApiOperationResponse<TModel extends Type<any>>(
  options: ApiOperationOptions & {
    responseType?: TModel | false | string;
    responsePage?: TModel;
  }
): MethodDecorator {
  const classDecorators = [
    ApiExtraModel(ApiSuccessRes),
    ApiExtraModel(ApiPageRes),
    ApiExtraModel(PageRes),
  ];
  const methodDecorators = [];
  if (options.responsePage) {
    classDecorators.push(ApiExtraModel(options.responsePage));
    methodDecorators.push(
      ApiResponse({
        schema: {
          $ref: getSchemaPath(ApiPageRes),
          properties: {
            data: {
              $ref: getSchemaPath(PageRes),
              description: '数据,code非200时值为undefined',
              properties: {
                list: {
                  type: 'array',
                  items: {
                    type: 'object',
                    $ref: getSchemaPath(options.responsePage),
                  },
                  description: '分页数据',
                },
              },
            },
          },
        },
      })
    );
  } else if (
    typeof options.responseType === 'function' ||
    typeof options.responseType === 'object'
  ) {
    classDecorators.push(ApiExtraModel(options.responseType));
    methodDecorators.push(
      ApiResponse({
        description: '请求成功',
        schema: {
          $ref: getSchemaPath(ApiSuccessRes),
          properties: {
            data: {
              type: 'object',
              $ref: getSchemaPath(options.responseType),
              description: '数据,code非200时值为undefined',
            },
          },
        },
      })
    );
  } else if (options.responseType !== false) {
    methodDecorators.push(
      ApiResponse({
        description: '请求成功',
        schema: {
          $ref: getSchemaPath(ApiSuccessRes),
          properties:
            typeof options.responseType === 'string'
              ? {
                  data: {
                    type: options.responseType,
                    description: '数据,code非200时值为undefined',
                  },
                }
              : undefined,
        },
      })
    );
  }
  ApiOperation(
    Object.assign(options, { successType: undefined, responsePage: undefined })
  );
  return <T>(
    target: (...args: any[]) => any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ) => {
    classDecorators.forEach(fn => fn(target));
    methodDecorators.forEach(fn => fn(target, propertyKey, descriptor));
    return createCustomMethodDecorator(API_OPERATIN_RESONSE_KEY, {}, false)(
      target,
      propertyKey,
      descriptor
    );
  };
}
