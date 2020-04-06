import { args } from './args';

// for --version, print & exit
if (args.version) {
    const json = require('../package.json');
    console.log(json.version);
    process.exit()
}

import ws from 'ws';
import crypto from 'crypto-js';
import chalk from 'chalk';
import { componentLog, log } from './logger';

import worker, { Result } from './work/';

// reading key from args
const { key, address } = args;

// ws connection
const wsLogger = new componentLog('WS client', '#00FFFF');
const wsClient = new ws(`ws://${address}`, {  })
    .on('open', () => wsLogger.success(`Connection established to ${chalk.yellowBright(`ws://${address}`)}.`))
    .on('error', (err) => {
        wsLogger.error(err.name);
        process.exit(1);
    })
    .on('close', (code, reason) => {
        wsLogger.info(`Disconnected, code ${code}.` + (reason ? `\nReason : ${reason}` : ''));
    })
    .on('message', (payload : string) => {
        try {
            let { id, name, data } = JSON.parse(payload) as { id: string, name: string, data: string };
            let code = crypto.AES.decrypt(data, crypto.PBKDF2(key, id, { keySize: 256 / 32 }).toString())
                .toString(crypto.enc.Utf8);
            code = crypto.enc.Utf8.stringify(crypto.enc.Base64.parse(code));
            
            wsLogger.info(`Received submission ${chalk.cyanBright(id)}, source file ${chalk.blueBright(name)}.`)
            worker.addQueue({ id, filename: name, code });
        } catch (e) {
            wsLogger.error(`${e}\n${e.stack}`);
        }
    })

worker.on('result', (r: Result) => wsClient.send(JSON.stringify(r)));

process.on('exit', () => log.info('Shutting down. Goodbye.'));
process.on('uncaughtException', (err) => { log.error(`${err}`); process.exit(1); })
process.on('unhandledRejection', (err) => { log.error(`${err}`); process.exit(1); })