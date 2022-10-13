import {MiddlewareParamArray} from '@midwayjs/core';
module '@midwayjs/core' {
    export declare function Controller(prefix?: string, routerOptions?: {
        sensitive?: boolean;
        middleware?: MiddlewareParamArray;
        description?: string;
        tagName?: string;
        ignoreGlobalPrefix?: boolean;
        mergeOption?:boolean;
    }): ClassDecorator;
}
export {};
