import { validate } from '../../src/tests/constraints';

describe('Test constraints', () => {
    describe(`valid constraints`, () => {
        it(`does not throw`, () => {
            expect(() => validate({
                memory: 1, stackSize: 1,
                wallTime: 0.1, cpuTime: 1.2, extraTime: 2.3,
                env: { presence: "1" }, score: 0.6
            })).not.toThrow()
        })
    })

    describe(`invalid constraints`, () => {
        it(`throws appropriate error (non-integer memory/stack size)`, () => {
            expect(() => validate({
                memory: 1, stackSize: 1.1,
                wallTime: 0.1, cpuTime: 1.2, extraTime: 2.3,
                env: { presence: "1" }, score: 0.6
            })).toThrowError(/Invalid test constraints/g)
            expect(() => validate({
                memory: 1.01, stackSize: 1,
                wallTime: 0.1, cpuTime: 1.2, extraTime: 2.3,
                env: { presence: "1" }, score: 0.6
            })).toThrowError(/Invalid test constraints/g)
        });
        it(`throws appropriate error (non-number memory/stack size)`, () => {
            expect(() => validate({
                memory: '', stackSize: {},
                wallTime: 0.1, cpuTime: 1.2, extraTime: 2.3,
                env: { presence: "1" }, score: 0.6
            })).toThrowError(/Invalid test constraints/g);
            expect(() => validate({
                memory: 'y21e', stackSize: 21,
                wallTime: 0.1, cpuTime: 1.2, extraTime: 2.3,
                env: { presence: "1" }, score: 0.6
            })).toThrowError(/Invalid test constraints/g);
            expect(() => validate({
                memory: 65561, stackSize: 'y723yru',
                wallTime: 0.1, cpuTime: 1.2, extraTime: 2.3,
                env: { presence: "1" }, score: 0.6
            })).toThrowError(/Invalid test constraints/g);
        });
        it(`throws appropriate error (non-number time/score)`, () => {
            expect(() => validate({
                memory: 1, stackSize: 1,
                wallTime: 0.1, cpuTime: 1.2, extraTime: 2.3,
                env: { presence: "1" }, score: ''
            })).toThrowError(/Invalid test constraints/g);
            expect(() => validate({
                memory: 1, stackSize: 1,
                wallTime: 0.1, cpuTime: 1.2, extraTime: 'aabcdeffg',
                env: { presence: "1" }, score: 0.79
            })).toThrowError(/Invalid test constraints/g);
        });
        it(`throws appropriate error (negative time/score)`, () => {
            expect(() => validate({
                memory: 1, stackSize: 1,
                wallTime: -0.1, cpuTime: 1.2, extraTime: 6.6,
                env: { presence: "1" }, score: 0.79
            })).toThrowError(/Invalid test constraints/g);
            expect(() => validate({
                memory: 1, stackSize: 1,
                wallTime: 0.1, cpuTime: -1.2, extraTime: 5.4,
                env: { presence: "1" }, score: -1
            })).toThrowError(/Invalid test constraints/g);
        })
        it(`throws appropriate error (invalid environment)`, () => {
            expect(() => validate({
                memory: 1, stackSize: 1,
                wallTime: 0.1, cpuTime: 1.2, extraTime: 'aabcdeffg',
                env: { "3yrt-3r34": "1" }, score: 0.79
            })).toThrowError(/Invalid test constraints/g);
            expect(() => validate({
                memory: 1, stackSize: 1,
                wallTime: 0.1, cpuTime: 1.2, extraTime: 'aabcdeffg',
                env: { right: {} }, score: 0.79
            })).toThrowError(/Invalid test constraints/g);
        })
    })
})