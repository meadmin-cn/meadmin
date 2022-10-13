import {mergeWith,cloneDeep} from 'lodash';
export function merge(target: any, src: any) {
    if (!target) {
        target = src;
        src = null;
    }
    if (!target) {
        return null;
    }
    if (Array.isArray(target)) {
        return target.concat(src || []);
    }
    if (typeof target === 'object') {
        const customizer = function(objValue: any, srcValue: any) {
            if (Array.isArray(objValue)) {
              return objValue.concat(srcValue);
            }
        }
        return mergeWith(cloneDeep(target), cloneDeep(src),customizer);
    }
    throw new Error('can not merge meta that type of ' + typeof target);
}
