import { Queue } from 'queue-typescript';
import { EventEmitter } from 'events';
import run from './run';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { componentLog } from '../logger';
import '../tests/';
import chalk from 'chalk';
import rr from 'rimraf';
import { args } from '../args';

export interface Submission {
    filename: string;
    code: string;
    id: string;
}

export interface Result {
    id: Submission['id'];
    totalScore: number;
    verdict?: string;
    tests?: { score: number; time: number; verdict: string; msg: string; }[]
    msg?: string;
}

class Worker extends EventEmitter {
    private queue = new Queue<Submission>();
    private workspace = mkdtempSync(join(tmpdir(), 'nop-worker-'), 'utf8');
    private idle = true;
    private logger : componentLog;

    /**
     * Initializes a worker
     * @param loggerTag Prefix for logger
     * @param keepWorkspace Whether to keep workspace on process exit
     */
    constructor(keepWorkspace : boolean, loggerTag : string = 'Worker') {
        super();
        this.logger = new componentLog('Worker');
        this.logger.info(`Initialized worker to use workspace ${chalk.cyanBright(this.workspace)}.`);
        if (keepWorkspace)
            process.on('exit', () => {
                rr.sync(this.workspace);
                this.logger.success(`Removed workspace at ${chalk.cyanBright(this.workspace)}`)
            })
    }

    // this is the main method to prepare stuff
    run () {
        if (!this.idle) return;
        while (this.queue.length) {
            let _ = this.queue.dequeue();
            // this.emit('', run(_, this.directory));
            run(_, this.workspace, r => {
                this.logger.success(`Finished submission ${chalk.bgBlueBright.black(r.id)}.`)
                this.emit('result', r)
            }, this.logger)
        }
    }

    addQueue(s : Submission) {
        this.queue.enqueue(s);
        this.logger.info(`Enqueued submission ${chalk.bgBlueBright.black(s.id)}.`);
        this.run();
    }
}

export default new Worker(args.keep);