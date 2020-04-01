/**
 * Originally at
 * https://github.com/minhducsun2002/boomer/blob/1e9b5b3cc23f8219884e236e4ccaec47d4ece067/src/lib/logger.ts.
 * This source file is licensed under CC-BY-4.0.
 */
import chalk from 'chalk';

export class log {
    static error(s: string) {
        log.log(`${chalk.bgRed('[Error]')}   ${s}`)
    }

    static warning(s: string) {
        log.log(`${chalk.bgYellow('[Warning]')} ${s}`)
    }

    static info(s: string) {
        log.log(`${chalk.bgBlue('[Info]')}    ${s}`)
    }

    static success(s: string) {
        log.log(`${chalk.bgGreenBright.black('[Success]')} ${s}`)
    }

    private static log(s: string) {
        let _ = s.split('\n'), d = `[${new Date().toJSON()}]`; 
        console.log(`${d} | ${_[0]}`);
        _.slice(1).forEach(a => console.log(`${' '.repeat(d.length)} | ${a}`))
    }
}

export class componentLog {
    private prefix = '';
    private bg = ''; private fg = '';
    constructor(s : string, bg = '#ffffff', fg = '#000000') {
        this.prefix = s;
        this.bg = bg; this.fg = fg;
    }

    private _ = (s : string) => chalk.bgHex(this.bg).hex(this.fg)(`[${this.prefix}]`) + ` ${s}`;
    error = (s : string) => log.error(this._(s))
    warning = (s : string) => log.warning(this._(s))
    info = (s : string) => log.info(this._(s))
    success = (s : string) => log.success(this._(s))
}