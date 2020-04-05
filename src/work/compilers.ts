import chalk from 'chalk';
import { execSync } from 'child_process';
import { resolve } from 'path';
import { args } from '../args';
import validate from 'validate.js';
import { componentLog } from '../logger';

interface check { pass: boolean; info: string };
interface compilerSetup {
    /**
     * Source file extension, for language recognition
     */
    extension: string;
    /**
     * Command to compile.
     * Must produce a single output file as named in `output`.
     */
    command: string[];
    /**
     * Command to check a compiler's availability.
     */
    test: string;
    /**
     * Timeout for both compilation and compiler check.
     */
    timeout: number;
    /**
     * Command to execute output file.
     */
    exec: string;
    /**
     * Output file name.
     */
    output: string;
    /**
     * Source file name. Submissions will be written to directory with this file name.
     * Should be something that `command` can recognize.
     */
    input: string;
}

// utils declaration
const compiler_json_path =  resolve(args.compilers);
    // default if not specified
const logger = new componentLog('Environment', '#ff9999', '#000');
validate.validators.type.types['array.string'] = (value : any) => validate.isArray(value) && validate.isString(value[0]);
    // custom type checker
function isolateCheck(): check {
    try {
        let _ = execSync("isolate --version", { timeout: 5 * 1000, encoding: 'utf8' });
        if (!_.includes("The process isolator")) return {
            pass: false,
            info: `Found ${chalk.yellow('isolate')} in ${chalk.yellowBright('PATH')}, `
                + `but could not confirm whether it's the isolate we need.`
        }
        return {
            pass: true,
            info: _.match(/commit\s(.*)/)[1]
        }
    }
    catch (e) {
        return {
            pass: false,
            info: `${e}`
        }
    }
}

// prepare checks
let checks = [[isolateCheck, "isolate sandbox"]];
let compilers = [] as compilerSetup[];

try {
    let _ = require(compiler_json_path) as compilerSetup[];
    checks.push(..._.map(_ => [
        () => {
            // validate object
            let $ = validate(_, {
                extension: { presence: true, type: 'string' },
                command: { presence: true, type: 'array.string' },
                output: { presence: true, type: 'string' },
                exec: { presence: true, type: 'string' },
                test: { presence: true, type: 'string' },
                timeout: { presence: true, type: 'number' },
                input: { presence: true, type: 'string' }
            });
            if ($) return { pass: false, info: `Invalid type for ${
                Object.keys($)
                    .map(s => chalk.yellowBright(s))
                    .join(', ')
            }` }

            try {
                // if it fails, it throws
                execSync(_.test, { stdio: 'ignore' });
                return { pass: true, info: `present` }
            } catch (err) {
                return { pass: false, info: `${err}` }
            }
        },
        `Compiler for ${_.extension} source code`
    ]))
    compilers = _;
} catch (err) {
    console.log(err);
    process.exit(1);
}

// check
logger.info('Checking environment...');
logger.info(`Reading compilers declaration from ${chalk.greenBright(compiler_json_path)}.`)
checks.forEach(([call, name]) => {
    let { pass, info } = (call as () => check)();
    (pass ? logger.success : logger.error)(`${name} : ${info}`);
    if (!pass) process.exit(1)
})

logger.success(`Environment validated.`);
export { compilers };