## Tests listing
#### Test
A test is a directory containing the following files :
- `input.txt` : Input file.
- `output.txt`: Output file, the desired output of the program assuming the input is `input.txt`.

The two files above must be present.

The following files are optional in certain cases :
- `constraints.json` : Constraints for this test.
- `judge.sh` : Program to judge whether the contestant's answer was correct.

#### Problem
A problem is a directory containing one or more tests as described above.

The test directory passed to `--tests` must contain at least one problems.

## Constraints
A test's constraints are declared in a file named `constraints.json`. Must be an object with these fields :
- `memory` : Control group's maximum memory usage in kilobytes. Passed to `--cg-mem` of `isolate`.
- `wallTime` : Wall clock time limit. Passed to `--wall-time`.
- `cpuTime` : Run time limit. Passed to `--time`.
- `extraTime` : Extra timeout. Passed to `--extra-time`.
- `stackSize` : Stack size. Passed to `--stack`.
- `score` : Score of this test, if the solution is accepted.
- `env` : Environments to be passed to the submissions. Passed to `--env`. In case you do not use this, pass an empty object.

See an example [here](./examples/contest1/tests/GCD/constraints.json).

#### Location
`constraints.json` can be located at the root of the problem directory, and it will be applied for all tests of this problem.
In that case, any tests that have its own `constraints.json` will be merged with the default one for the problem.

If there is no default `constraints.json` for a problem,
all tests must have their own `constraints.json` in respective directories.

`nop` performs validation on the merged constraints, so it is possible to define partial constraints globally for a problem,
then the rest is defined in each test.

## Judge
A test's judge must be an executable file named `judge.sh`.
This can be located at the root of the problem directory or specified with a test,
which overrides the problem's default if present.

It will be invoked with the first argument being the path to the contestant's output file,
and the second argument being the path to the answer file.

An exit status of 0 means the output was correct. Anything else means wrong output.

`nop` performs permission check on the file. To be exact, it [checks for executable permission](./src/tests/index.ts#L112).
