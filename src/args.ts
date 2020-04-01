import yargs from 'yargs';
import chalk from 'chalk';

export let args = yargs
    .option('key', {
        description: `Communication key with Wafter. Do not make this public!`,
        type: 'string',
        alias: 'k',
        required: true
    })
    .option('address', {
        description: `Wafter address. `
                    + `Specify in the form of `
                    + `${chalk.yellowBright('host')}:${chalk.magentaBright('port')}/${chalk.greenBright('path')}.`,
        type: 'string',
        alias: 'a',
        required: true
    })
    .option('compilers', {
        description: `Path to compiler declaration.`,
        type: 'string',
        default: './compiler.json',
        alias: 'c',
        required: true
    })
    .option('version', {
        description: 'Show version info.',
        type: 'boolean'
    })
    .argv