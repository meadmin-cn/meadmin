import {merge} from '../../src'
describe('test/util/index.test.ts', () => {
    it('merge src null ', async () => {
        expect(merge(
           {a:1},
            null
        )).toStrictEqual({a:1})
    });
    it('merge target null ', async () => {
        expect(merge(
            null,
           {a:1}
        )).toStrictEqual({a:1})
    });
    it('merge target null src null ', async () => {
        expect(merge(
            null,
            null
        )).toEqual(null)
    });
    it('merge error ', async () => {
        expect(()=>merge(2,0)).toThrowError('can not merge meta that type of number')
    });
    it('merge object ', async () => {
        expect(merge(
           {a:1},
           {a:3,b:2}
        )).toStrictEqual({
            a:3,
            b:2
        })
    });
    it('merge object array', async () => {
        expect(merge(
           {a:['1']},
           {a:['1','2'],b:2}
        )).toStrictEqual({
            a:['1','1','2'],
            b:2
        })
    });
    it('merge array', async () => {
        expect(merge([1,2],[2,3,4])).toStrictEqual([1,2,2,3,4])
    });
    it('merge array null', async () => {
        expect(merge([1,2],null)).toStrictEqual([1,2])
    });
});