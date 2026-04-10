import { ApiPageRes, PageRes } from '@/response/apiPage.res.js';
import { ApiSuccessRes, ApiSuccessResArr } from '@/response/apiSuccess.res.js';
import { getKeyInfo } from '@meadmin/cli/utils/formatting';
import { createCustomMethodDecorator } from '@midwayjs/core';
import { ApiOperationOptions, ApiPropertyOptions, Type } from '@midwayjs/swagger';
import { ApiExtraModel, ApiOperation, ApiProperty, ApiResponse, getSchemaPath } from '@midwayjs/swagger';
import { RuleType } from '@midwayjs/validate';
import { Rule } from '@midwayjs/validate';

// 装饰器内部的唯一 id
export const API_OPERATIN_RESONSE_KEY = 'meadmin:swagger:api_operation_respose';
/**
 * swagger返回参数装饰器
 * @param options
 * @returns
 */
export function ApiOperationResponse<TModel extends Type<any>>(
  options: ApiOperationOptions & {
    responseType?: TModel | false | string; //返回格式
    responsePage?: TModel; //分页返回list格式
    responseList?: TModel; //data数组返回,元素格式
  },
): MethodDecorator {
  const classDecorators = [ApiExtraModel(ApiSuccessRes), ApiExtraModel(ApiPageRes), ApiExtraModel(PageRes)];
  const methodDecorators = [] as MethodDecorator[];
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
      }),
    );
  } else if (options.responseList) {
    if (typeof options.responseList === 'object') {
      classDecorators.push(ApiExtraModel(options.responseList));
    }
    methodDecorators.push(
      ApiResponse({
        description: '请求成功',
        schema: {
          $ref: getSchemaPath(ApiSuccessResArr),
          properties: {
            data: {
              type: 'array',
              description: '数据,code非200时值为undefined',
              items: {
                $ref: typeof options.responseList === 'object' ? getSchemaPath(options.responseList) : undefined,
                type: typeof options.responseList === 'object' ? undefined : options.responseList,
              },
            },
          },
        },
      }),
    );
  } else if (typeof options.responseType === 'function' || typeof options.responseType === 'object') {
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
      }),
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
      }),
    );
  }
  methodDecorators.push(ApiOperation(Object.assign(options, { successType: undefined, responsePage: undefined })));
  return <T>(target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
    classDecorators.forEach((fn) => fn(target.constructor));
    methodDecorators.forEach((fn) => fn(target, propertyKey, descriptor));
    return createCustomMethodDecorator(API_OPERATIN_RESONSE_KEY, {}, false)(target, propertyKey, descriptor);
  };
}

/**
 * swagger和rule校验结合，会自动根据rule规则生成对应配置,rule存在时才会传入入参
 * @param options
 * @returns
 */
export function ApiPropertyRule(options?: ApiPropertyOptions & { rule?: RuleType.AnySchema<any> }): PropertyDecorator {
  const propertyDecorators = [] as PropertyDecorator[];
  if (options && options.rule) {
    if (!options.rule.$_getFlag('label') && options.description) {
      options.rule = options.rule.label(`{${getKeyInfo(options.description).name}}`);
    }
    if (options.required === undefined) {
      options.required = options.rule.$_getFlag('presence') === 'required' ? true : undefined;
    }
    if (!options.enum && options.rule.describe().allow && options.rule.$_getFlag('only')) {
      options.enum = options.rule.describe().allow;
    } else if (options.enum && !options.enum.length) {
      options.enum = undefined;
    }
    if (!options.required && !(options.rule as any)._invalids?._values.has(null)) {
      //如果不是必填值，允许null
      options.rule = options.rule.allow(null);
    }
    if (options.rule.type === 'number') {
       if(!options.type )options.type = 'number';
      if (options.maximum !== undefined) {
        options.maximum = options.rule.$_getRule('max')?.args?.limit;
      }
      if (options.minimum !== undefined) {
        options.minimum = options.rule.$_getRule('min')?.args?.limit;
      }
    }
    if (options.rule.type === 'string') {
      if(!options.type )options.type = 'string';
      options.rule.empty(''); //将 空串视为空而不是无效值,否则空串会被 stripUnknown 配置 视为无效值处理掉
      if (options.maxLength !== undefined) {
        options.maxLength = options.rule.$_getRule('max')?.args?.limit;
      }
      if (options.minLength !== undefined) {
        options.minLength = options.rule.$_getRule('min')?.args?.limit;
      }
      if (!options.required && !(options.rule as any)._invalids?._values.has('')) {
        //如果不是必填值，允许空串
        options.rule = options.rule.allow('');
      }
    }
    if (!options.type && options.rule.type === 'date') {
      options.type = 'date';
    }
    if (!options.type && options.rule.type === 'object') {
      options.type = 'object';
    }
    if (options.default !== undefined) {
      options.default = options.rule.$_getFlag('default');
    }
    propertyDecorators.push(Rule(options.rule));
  }
  propertyDecorators.push(ApiProperty(options));

  return (target: object, propertyKey: string | symbol) => {
    propertyDecorators.forEach((fn) => fn(target, propertyKey));
  };
}
