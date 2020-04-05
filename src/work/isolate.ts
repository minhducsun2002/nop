import { Verdict } from './verdicts';

// parse isolate meta files
export default function (s: string) {
    let _ = new Map<string, string>();
    s.split('\n').map(a => a.trim()).forEach(s => {
        let [key, value] = s.split(':').map(a => a.trim());
        _.set(key, value);
    })
    return _;
}

// parse status
export function parseStatus (s: string) {
    if (!s) return null;

    // non zero exit
    if (s.toUpperCase() === 'RE') return Verdict.RUNTIME_ERROR;
    // killed by signal 
    if (s.toUpperCase() === 'SG') return Verdict.RUNTIME_ERROR;
    // time out
    if (s.toUpperCase() === 'TO') return Verdict.TIME_LIMIT_EXCEEDED;
    // internal error -> run-time error
    if (s.toUpperCase() === 'XX') return Verdict.RUNTIME_ERROR;

    return null;
}