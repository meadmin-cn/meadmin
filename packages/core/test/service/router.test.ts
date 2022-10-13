import { RouterService } from './../../src/service/router.service';
import { Controller, CONTROLLER_KEY, getClassMetadata } from "@midwayjs/core";
// import { close, createLightApp } from "@midwayjs/mock";
// import * as custom from '../../src';

@Controller('/1', {
    sensitive: true,
    middleware: ['hello1'],
    description: 'controller1',
})
class Test1Controller { }

@Controller('/2', {
    sensitive: true,
    middleware: ['hello2'],
    tagName: '2'
})
class Test2Controller extends Test1Controller { }

@Controller('/3', {
    sensitive: true,
    description: 'controller3',
    tagName: '3'
})
class Test3Controller extends Test2Controller { }

@Controller('/4', { sensitive: true, mergeOption: false })
class Test4Controller extends Test3Controller { }

@Controller('/5', {
    sensitive: true,
    middleware: ['hello5'],
    description: 'controller5',
    tagName: '5'
})
//@ts-igonre
class Test5Controller extends Test4Controller { }

describe('test/service/router.test.ts', () => {
    it('批量设置@controller装饰器参数 ', async () => {
        // 传入 class 忽略泛型也能正确推导
        const routerService = new RouterService;
        routerService.initControllerOption()
        expect(getClassMetadata(
            CONTROLLER_KEY,
            Test1Controller
        )).toStrictEqual({
            prefix: '/1',
            routerOptions: {
              sensitive: true,
              middleware: [ 'hello1' ],
              description: 'controller1',
              mergeOption: false,
            }
        })
        expect(getClassMetadata(
            CONTROLLER_KEY,
            Test2Controller
        )).toStrictEqual({
            prefix: '/1/2',
            routerOptions: {
              sensitive: true,
              middleware: [ 'hello1','hello2' ],
              description: "controller1",
              tagName: '2',
              mergeOption: false,
            }
        })
        expect(getClassMetadata(
            CONTROLLER_KEY,
            Test3Controller
        )).toStrictEqual({
            prefix: '/1/2/3',
            routerOptions: {
              sensitive: true,
              mergeOption: false,
              description: "controller3",
              middleware: [ 'hello1','hello2' ],
              tagName: '3'
            }
        })
        expect(getClassMetadata(
            CONTROLLER_KEY,
            Test4Controller
        )).toStrictEqual({
            prefix: '/4',
            routerOptions: {
              sensitive: true,
              mergeOption: false,
            }
        })
        expect(getClassMetadata(
            CONTROLLER_KEY,
            Test5Controller
        )).toStrictEqual({
            prefix: '/4/5',
            routerOptions: {
              sensitive: true,
              middleware: [ 'hello5' ],
              description: 'controller5',
              tagName: '5',
              mergeOption: false,
            }
        })
    });
});