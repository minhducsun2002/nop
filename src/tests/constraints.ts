import v from 'validate.js';

v.validators.type.types['integer'] = (value : any) => Number.isSafeInteger(value);

export function validate(c : any) {
    let _ = v(c, {
        memory: { presence: true, numericality: { onlyInteger: true, greaterThan: 0 } },
        stackSize: { presence: true, numericality: { onlyInteger: true, greaterThan: 0 } },
        wallTime: { presence: true, numericality: { greaterThan: 0 } },
        cpuTime: { presence: true, numericality: { greaterThan: 0 } },
        extraTime: { presence: true, numericality: { greaterThan: 0 } },
        env: { presence: true },
        score: { presence: true, numericality: { greaterThanOrEqualTo: 0 } }
    })

    if (_) throw new TypeError(`Invalid test constraints :\n${JSON.stringify(_, null, 4)}`);
    if (v.isArray(c.env) || (!v.isObject(c.env)))
        throw new TypeError(`Invalid test constraints : env must be an object!`)
    let { env } = c as { [id: string]: any };
    for (let k in env) if (!/[a-zA-Z_]+[a-zA-Z0-9_]*/.test(k))
        throw new TypeError(`Invalid test constraints : env var name must be valid. Check "${k}" variable.`)
    for (let k in env) if (!v.isString(env[k]))
        throw new TypeError(`Invalid test constraints : env must map a string to a string. Check "${k}" variable.`)
}