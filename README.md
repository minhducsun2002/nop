# `nop`
###### Judge client on Linux for use with [`vnma0/wafter`](https://github.com/vnma0/wafter)

## Requirements
- [`isolate`](https://github.com/ioi/isolate), executable from your user.

  On my machine, the `isolate` binary has SUID on it, through the executable flag is only set for 
  users of group `isolate`.
- Wafter must be built with commit later than
  [`2c6be1f05344d56a73c8856704703e89e35a0a71`](https://github.com/vnma0/wafter/commit/2c6be1f05344d56a73c8856704703e89e35a0a71).
  
## Installation
Currently, I don't have a solution to bundle all scripts into a single executable.
If you still want to check out, the entry point is at `src/index.ts`.

`ts-node` is specified in [`package.json`](./package.json) as a development dependency,
`yarn` then `npx ts-node src/index.ts` should be enough.

## Usage
Pass `--help` when you run the program. Alternatively see [`src/args.ts`](./src/args.ts).
- `key`, `k`

  The key used for communication with [`vnma0/wafter`](https://github.com/vnma0/wafter).
  A version of Wafter satisfying the above requirements should print out the key for you.
- `address`

  Address to Wafter WebSocket endpoint. Most of the time it is `<host>:<port>/kon` or something similar.
- `compilers`
  
  Path to a JSON file containing an array listing available compilers. See [`compilers.md`](./docs/compilers.md).
- `version`
  
  Self-explanatory.
- `tests`
  
  A folder to keep tests for solutions. See [`tests.md`](./docs/tests.md).
- `keep`

  `nop` will create a workspace folder in the temporary location of the OS.
  Specifying this will prevent `nop` from removing it upon exit.
