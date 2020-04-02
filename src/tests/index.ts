import { args } from '../args';
import { componentLog } from '../logger';
import { readdirSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import chalk from 'chalk';
import { validate } from './constraints';

const logger = new componentLog('Tests', '#8b008b', '#fff');
const input = 'input.txt', output = 'output.txt', constraints = 'constraints.json';

interface Test {
    /**
     * Path to input file
     */
    input: string;
    /**
     * Path to output file ("answer")
     */
    output: string;
    /**
     * Test case name.
     * The name of the directory containing `input.txt` & `output.txt`
     */
    name: string;
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
    let tests = readdirSync(join(testsPath, p), 'utf8'),
        _ = `==> `;
    logger.info(`${_}Preparing ${tests.length} test(s) for problem ${chalk.bgYellowBright.black(p)}`);
    let __ = tests.map((t) : Test => {
        // logger.info
        let inp = join(testsPath, p, t, input),
            out = join(testsPath, p, t, output),
            con = join(testsPath, p, t, constraints);
        // test if we can read this time
        readFileSync(inp);
        readFileSync(out);
        readFileSync(con);
        // test constraints format
        try {
            validate(require(con));
        } catch (e) {
            logger.error(`${e}`);
            throw new Error(`Validation for constraints of test "${t}" of problem "${p}" failed!`)
        }
        // if there was any error, an error should have been thrown
        // at this point, tests are considered valid
        logger.success(`${' '.repeat(_.length)}Prepared test ${chalk.bgGrey(t)}.`);
        return { input: inp, output: out, name: t }
    })
    problems.set(p, { tests: __ })
})

export { problems };