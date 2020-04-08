import { validate } from '../../src/tests/constraints';

describe('Test constraints', () => {
    const baseValid = {
        memory: 1, stackSize: 1, wallTime: 1, cpuTime: 1, extraTime: 1,
        env: { "1a": "1" }, score: 1
    }
    describe(`valid`, () => {
        it('should not throw', done => {
            validate(baseValid);
            done();
        })
    })
})