import type { Submission, Result } from '.';
import { compilers as c } from './compilers';
import { extname, join, basename } from 'path';
import { writeFileSync, copyFileSync } from 'fs';
import { execSync, execFileSync } from 'child_process';
import type { spawnSync } from 'child_process';
import { Md5 } from 'md5-typescript';
import { problems, names } from '../tests/';

import { componentLog } from '../logger';
import chalk from 'chalk';

// prepare compilers
const compilers = new Map<string, typeof c[0]>();
c.forEach(c => compilers.set(c.extension, c));

/**
 * 
 * @param s Submission to be run
 * @param workspace Workspace directory to prepare this
 * @param onResult Callback to run when result is available
 */
export default function (
    s : Submission,
    workspace : string,
    onResult : (res : Result) => void,
    logger = new componentLog(`Worker ${workspace}`)
) {
    let { code, id, filename } = s;
    let ext = extname(filename).slice(1), prob = basename(filename, extname(filename));
    // if no appropriate compiler found,
    // just quit?
    if (!compilers.has(ext)) {
        // slice(1) as the dot is there
        logger.error(`Could not find an appropriate compiler for ${id}/${filename}. I am quitting!`);
        return
    }

    // if no problem found, quit altogether?
    if (!problems.has(prob)) {
        logger.error(`Could not determine problem code for ${id}/${filename}. You missed something.`);
        return;
    }

    let { input , command, output, exec } = compilers.get(ext);

    // write file to workspace
    writeFileSync(join(workspace, input), code);
    try {
        command.forEach(c => execSync(c, { cwd: workspace, stdio: ['ignore', 'ignore', 'pipe'] }))
    } catch (e) {
        // console.log(e);
        let { pid, stderr, status, signal } = (e as ReturnType<typeof spawnSync>);
        onResult({
            id,
            verdict: 'CE',
            totalScore: 0,
            msg: (stderr.length
                ? stderr.toString() 
                : (signal ? `Process PID ${pid} killed with signal ${signal}` : `Process exited with return code ${status}`)
            )
        })
        return;
    }

    // at this point, it can be considered submissions successfully compiled
    let outputPath = join(workspace, output);
    // now is time to run?
    logger.info(`Successfully compiled submission ${chalk.bgBlueBright(id)}.`)
    
    try {
        

        // run
        let { tests } = problems.get(prob);
        let result = tests.map(({ input: _inp, output: _out, name, constraints: c }) => {
            // maximum box count = 1000
            // isolate said so??
            let boxId = parseInt(Md5.init(workspace + name + id).slice(0, 4), 16) % 1000;
            if (!Number.isSafeInteger(boxId)) boxId = 0;

            // cleanup first
            execSync(`isolate --cg --cleanup -b ${boxId}`, { stdio: 'ignore' });
            // init
            let dir = execSync(`isolate --cg --init -b ${boxId}`, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' }).trim();
            logger.info(`Initialized sandbox at ${chalk.yellowBright(dir)}.`);
            
            // copy file
            copyFileSync(outputPath, join(dir, 'box', output));
            logger.info(`Copied to ${chalk.yellowBright(join(dir, 'box', output))}.`)

            // copy tests
            copyFileSync(_inp, join(dir, 'box', names.input));
            logger.info(`Copied ${chalk.yellowBright(_inp)} to ${chalk.greenBright(join(dir, 'box', names.input))}`)
            writeFileSync(join(dir, 'box', names.output), '');
            try {
                execFileSync(
                    `isolate`, [
                        `-b ${boxId}`,
                        `--cg`,
                        `--cg-mem=${c.memory}`,
                        `--time=${c.cpuTime}`,
                        `--wall-time=${c.wallTime}`,
                        `--stack=${c.stackSize}`,
                        `-i${names.input}`,
                        `-o${names.output}`
                    ]
                    .concat(Object.keys(c.env).map(k => `--env=${k}=${c.env[k]}`))
                    .concat(['--run', '--', exec]),
                    { encoding: 'utf8', stdio: ['ignore', 'ignore', 'inherit'] },
                );
                return {
                    score: 1.0,
                    verdict: 'AC',
                    time: 1.0,
                    msg: ''
                }
            } catch (e) {
                let { pid, stderr, signal } = (e as ReturnType<typeof spawnSync>);
                return {
                    score: 0.0,
                    verdict: 'RTE',
                    time: 1.0,
                    msg: (stderr.length
                        ? stderr.toString() 
                        : (signal ? `Process PID ${pid} killed with signal ${signal}` : `Process exited with return code ${status}`)
                    )
                }
            }
        })

        onResult({
            id,
            totalScore: result.reduce((r, c) => r + c.score, 0),
            verdict: 'WA',
            tests: result,
            msg: 'yes'
        })
    } catch (e) {
        logger.error(`${e}`);
    }
}