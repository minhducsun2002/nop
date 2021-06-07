export enum Verdict {
    ACCEPTED = 'AC',
    WRONG_OUTPUT = 'WA',
    TIME_LIMIT_EXCEEDED = 'TLE',
    RUNTIME_ERROR = 'RTE'
}

export enum BitVerdict {
    ACCEPTED = 0b000,
    WRONG_OUTPUT = 0b100,
    TIME_LIMIT_EXCEEDED = 0b010,
    RUNTIME_ERROR = 0b001
}