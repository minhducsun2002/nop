## Compilers listing 
`compilers.json` must be an array listing available compilers.

Each array element must have the following properties :
  - `extension` : `string`
  
    This is used to check whether a submission matches to a given compiler.
    For example, `file1.cpp` will be compiled by a compiler with `extension` set to `cpp`.
  - `input` : `string`
    
    The submission will be written to disk in this name before compilation.
  - `output` : `string`
    
    The compiled submission will be written to disk in this name.
  - `command` : `string[]`
  
    An array of commands to run in order to compile that submission.
    These commands will be run with current working directory containing a file named as in the `input` field.
    
    They should produce a file named as in the `output` field.
  - `exec` : `string`
    
    Command to run this submission. It will be executed inside an `isolate` sandbox.
  - `test` : `string`
  
    Command to test compiler's presence. Must exit with status code of 0 to be counted as present.
  - `timeout` : `number`
  
    Number of miliseconds to run the compilation before killing the process, which counts as a CE.
