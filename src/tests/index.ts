import { args } from '../args';
import { componentLog } from '../logger';
import { readdirSync, accessSync, statSync, existsSync, constants } from 'fs';
import { resolve, join } from 'path';
import chalk from 'chalk';
import { validate } from './constraints';
import merge from 'deepmerge';

const logger = new componentLog('Tests', '#8b008b', '#fff');
const input = 'input.txt', output = 'output.txt', constraints = 'constraints.json', judge = 'judge.sh';

interface Constraints {
    /** Maximum memory limit */
    memory: number;
    /** Wall time */
    wallTime: number;
    /** CPU time */
    cpuTime: number;
    /** Maximum stack size */
    stackSize: number;
    /**
     * `-x, --extra-time=<time>`
     * Set extra timeout, before which a timing-out program is not yet killed, 
     * so that its real execution time is reported
     * @see https://github.com/ioi/isolate/blob/990e60b563a4ab2c62010d451ea0e974953ad0f6/isolate.c#L917
     */
    extraTime: number;
    /**
     * Environment to passed to `isolate`
     */
    env: { [id: string]: string; };
    /**
     * Score
     */
    score: number;
}

interface Test {
    /** Path to input file */
    input: string;
    /** Path to output file ("answer") */
    output: string;
    /**
     * Test case name.
     * The name of the directory containing `input.txt` & `output.txt`
     */
    name: string;
    /** Test constraints */
    constraints: Constraints;
    /** Path to judger */
    judge: string;
}
interface Problem { tests: Test[] }

// absolute path
let testsPath = resolve(args.tests);
// list problems
let problemsList = readdirSync(testsPath, 'utf8');
// map problem name -> Problem setup
let problems = new Map<string, Problem>();

logger.info(`Reading tests for ${problemsList.length} problem(s) from ${chalk.cyanBright(testsPath)}...`);
problemsList.forEach(p => {
    // path to tests of this problem
    let pTests = join(testsPath, p);
    // folder of each tests
    let tests = readdirSync(pTests, 'utf8').filter(f => statSync(join(pTests, f)).isDirectory()),
        // padding string
        _ = `==> `;
    logger.info(`${_}Preparing ${tests.length} test(s) for problem ${chalk.bgYellowBright.black(p)}`);

    // global test constraints
    let globalConstraints : Partial<Constraints> = {};
    try { globalConstraints = require(join(pTests, constraints)) } catch {};

    // global judge for this problem
    let globalJudge = existsSync(join(pTests, judge)) && join(pTests, judge);

    // check test individually
    let __ = tests.map((t) : Test => {
        let inp = join(pTests, t, input),
            out = join(pTests, t, output),
            con = join(pTests, t, constraints),
            jdg = join(pTests, t, judge);

        // test if we can read input/output
        [inp, out].forEach(_ => accessSync(_, constants.R_OK));

        // local test constraints
        let localConstraints : Partial<Constraints> = {};
        try { localConstraints = require(con) } catch {};

        let _constraints = merge(globalConstraints, localConstraints) as Constraints;

        // test constraints format
        try { validate(_constraints); } catch (e) {
            logger.error(`${e}`);
            throw new Error(`Validation for constraints of test "${t}" of problem "${p}" failed!`)
        }

        // test if judge available
        /**
         * We check for test-specific judge first.
         * If not found, we fall back to global judge, else test for execution capability as normal.
         * The reason is that if test-specific judge is present but non-executable, it is probably
         * a configuration error.
         */
        
        if (!existsSync(jdg)) jdg = globalJudge;
        if (!jdg) throw new Error(`Judge of test "${t}" of problem "${p}" isn't present!`)

        try { accessSync(jdg, constants.X_OK) } catch (e) {
            logger.error(`${e}`);
            throw new Error(`Judge of test "${t}" of problem "${p}" isn't executable!`)
        }

        // if there was any error, an error should have been thrown
        // at this point, tests are considered valid
        logger.success(`${' '.repeat(_.length)}Prepared test ${chalk.bgGrey(t)}.`);
        return { input: inp, output: out, name: t, constraints: _constraints, judge: jdg }
    })
    problems.set(p, { tests: __ })
})

export { problems };
export let names = { input, output, constraints };