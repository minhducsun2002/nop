import type { Submission, Result } from '.';
import { compilers as c } from '../compilers';
import { extname, join } from 'path';
import { writeFileSync } from 'fs';
import { execSync } from 'child_process';
import type { spawnSync } from 'child_process';

import { componentLog } from '../logger';

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
    let ext = extname(filename).slice(1);
    // if no appropriate compiler found,
    // just quit?
    if (!compilers.has(ext)) {
        // slice(1) as the dot is there
        logger.error(`Could not find an appropriate compiler for ${id}/${filename}. I am quitting!`);
        return
    }

    let { input, command, output } = compilers.get(ext);

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
    // now is time to run?
    
}