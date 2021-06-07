import type { Submission, Result } from '.';
import { compilers as c } from './compilers';
import { extname, join, basename } from 'path';
import { writeFileSync, copyFileSync, readFileSync } from 'fs';
import { execSync, spawnSync } from 'child_process';
import { Md5 } from 'md5-typescript';
import { problems, names } from '../tests/';
import parseLog, { parseStatus, parseStatusBit } from './isolate';
import { Verdict, BitVerdict } from './verdicts';
import parseCommand from 'argv-split';
import { componentLog } from '../logger';
import chalk from 'chalk';
import judge from './judge';
import compile from './compile';

// prepare compilers
const compilers = new Map<string, typeof c[0]>();
c.forEach(c => compilers.set(c.extension, c));

// meta file name
const meta = 'meta.txt';

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
    
    if (!compilers.has(ext))
        return logger.error(`Could not find an appropriate compiler for ${id}/${filename}. Ignoring`);
    
    if (!problems.has(prob))
        return logger.error(`Could not determine problem code for ${id}/${filename}. Ignoring.`);

    let { input , command, output, exec } = compilers.get(ext);

    // write file to workspace
    writeFileSync(join(workspace, input), code);
    let compileLog = [] as string[];
    try { compile(workspace, command, s => compileLog.push(s)); } catch (e) {
        let { pid, stderr, status, signal } = (e as ReturnType<typeof spawnSync>);
        return onResult({
            id, verdict: 'CE', totalScore: null,
            tests: [],
            msg: (stderr.length
                ? stderr.toString()
                : (signal
                    ? `Process PID ${pid} killed with signal ${signal}`
                    : `Process exited with return code ${status}`)
            )
        })
    }

    logger.success(`Prepared submission ${chalk.bgBlueBright.black(id)}.`)
    
    let outputPath = join(workspace, output);
    // maximum box count = 1000
    let boxId = parseInt(Md5.init(workspace + prob + id).slice(0, 4), 16) % 1000;
    let clean = () => execSync(`isolate --cg --cleanup -b ${boxId}`, { stdio: 'ignore' });;

    try {
        let result = problems.get(prob).tests.map(
            ({ input: _inp, output: _out, constraints: c, judge: _judge }) => {
            clean();
            let dir = execSync(
                `isolate --cg --init -b ${boxId}`, {
                    stdio: ['ignore', 'pipe', 'ignore'],
                    encoding: 'utf8'
                }
            ).trim();


            let outputFile = join(dir, 'box', names.output);
            copyFileSync(outputPath, join(dir, 'box', output)); // copy submission
            copyFileSync(_inp, join(dir, 'box', names.input));  // copy tests
            writeFileSync(outputFile, '');  // write empty output file

            // meta file
            const metaFile = join(workspace, meta);

            let run = spawnSync(`isolate`, [
                    `-b ${boxId}`,
                    `--cg`, `--cg-mem=${c.memory}`,
                    `--time=${c.cpuTime}`, `--wall-time=${c.wallTime}`, `--stack=${c.stackSize}`,
                    `-i${names.input}`, `-o${names.output}`, `-M${metaFile}`
                ]
                .concat(Object.keys(c.env).map(k => `--env=${k}=${c.env[k]}`))
                .concat(['--run', '--']).concat(parseCommand(exec)),
                { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
            )

            let _ = parseLog(readFileSync(metaFile, 'utf8')),
                accepted = run.status === 0 ? judge(_judge, outputFile, _out) : false
            clean();
            return {
                score: accepted ? c.score : 0,
                verdict: parseStatus(_.get('status')) || (accepted ? Verdict.ACCEPTED : Verdict.WRONG_OUTPUT),
                verdBit: parseStatusBit(_.get('status')) || (accepted ? BitVerdict.ACCEPTED : BitVerdict.WRONG_OUTPUT),
                time: +_.get('time-wall'),
                msg: (_.get('message') || '')
            }
        })

        onResult({
            id,
            totalScore: result.reduce((r, c) => r + c.score, 0),
            verdict: result.find(r => r.verdict !== Verdict.ACCEPTED)?.verdict || Verdict.ACCEPTED,
            tests: result,
            msg: compileLog.join('\n')
        })
    } catch (e) {
        logger.error(`${e}`);
    }
}