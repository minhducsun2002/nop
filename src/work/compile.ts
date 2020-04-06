import parse from 'argv-split';
import { spawnSync } from 'child_process';

/**
 * Run commands to compile a solution.
 * Throws the return value of `spawnSync` in case of error | non-zero status.
 * @param cwd CWD to run commands in 
 * @param command Commands to run
 * @param onstderr Function to call when a command writes to stderr
 */
export default function compile(cwd : string, command : string[], onstderr: (s : string) => void = () => 0) {
    command.forEach(c => {
        let cmd = parse(c);
        let out = spawnSync(cmd[0], cmd.slice(1), {
            encoding: 'utf8', stdio: ['ignore', 'ignore', 'pipe'], cwd
        });
        onstderr(out.stderr);
        if (out.status !== 0) throw out;
    })
}