import { Queue } from 'queue-typescript';
import { EventEmitter } from 'events';
import run from './run';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { componentLog } from '../logger';
import '../tests/';
import chalk from 'chalk';

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
    private directory = mkdtempSync(join(tmpdir(), 'nop-worker-'), 'utf8');
    private idle = true;
    private logger = new componentLog('Worker');

    constructor() {
        super();
        this.logger.info(`Initialized worker to use workspace ${chalk.cyanBright(this.directory)}.`)
    }

    // this is the main method to prepare stuff
    run () {
        if (!this.idle) return;
        while (this.queue.length) {
            let _ = this.queue.dequeue();
            // this.emit('', run(_, this.directory));
            run(_, this.directory, r => {
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

export default new Worker();