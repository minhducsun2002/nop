import v from 'validate.js';

v.validators.type.types['integer'] = (value : any) => Number.isSafeInteger(value);

export function validate(c : any) {
    let _ = v(c, {
        memory: { presence: true, type: 'integer' },
        stackSize: { presence: true, type: 'integer' },
        wallTime: { presence: true, type: 'number' },
        cpuTime: { presence: true, type: 'number' },
        extraTime: { presence: true, type: 'number' },
        env: { presence: true } 
    })

    if (_) throw new TypeError(`Invalid test constraints :\n${_}`);
    if (v.isArray(c.env) || (!v.isObject(c.env)))
        throw new TypeError(`Invalid test constraints : env must be an object!`)
    let { env } = c as { [id: string]: any };
    for (let k in env) if (!v.isString(env[k]))
        throw new TypeError(`Invalid test constraints : env must map a string to a string. Check "${k}" variable.`)
}