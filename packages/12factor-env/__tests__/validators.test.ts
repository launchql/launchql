import { inspect } from 'node:util';

import {
  cleanEnv,
  distinct,
  duration,
  email,
  enumerated,
  env,
  host,
  int,
  list,
  mutuallyExclusive,
  num,
  oneOf,
  port,
  redactEnvError,
  requiredWhen,
  str,
  url,
  uuid,
  withDefault} from '../src';

describe('list()', () => {
  it('splits, trims and drops empty entries', () => {
    const config = cleanEnv({ KINDS: ' api_key , jwt ,, ' }, { KINDS: list() });
    expect(config.KINDS).toEqual(['api_key', 'jwt']);
  });

  it('errors when set but empty, instead of yielding []', () => {
    // an allowlist that silently becomes [] is an allowlist that allows nothing
    expect(() => cleanEnv({ KINDS: ' , ' }, { KINDS: list() })).toThrow(/KINDS: Empty list/);
    expect(() => cleanEnv({ KINDS: '' }, { KINDS: list() })).toThrow(/KINDS: Empty list/);
  });

  it('enforces choices per item, not against the whole array', () => {
    const spec = { KINDS: list({ choices: ['api_key', 'jwt'] as const }) };
    expect(cleanEnv({ KINDS: 'jwt,api_key' }, spec).KINDS).toEqual(['jwt', 'api_key']);
    expect(() => cleanEnv({ KINDS: 'jwt,cookie' }, spec)).toThrow(
      /KINDS: Invalid list value\(s\) "cookie" not in choices \[api_key, jwt\]/
    );
  });

  it('supports a custom separator', () => {
    const config = cleanEnv({ DIRS: '/usr/bin:/bin' }, { DIRS: list({ separator: ':' }) });
    expect(config.DIRS).toEqual(['/usr/bin', '/bin']);
  });

  it('accepts a typed default', () => {
    const config = cleanEnv({}, { KINDS: withDefault(list, ['api_key']) });
    expect(config.KINDS).toEqual(['api_key']);
  });

  it('is usable through env(), where the second pass sees an array', () => {
    const config = env({ KINDS: 'api_key,jwt' }, {}, { KINDS: list() });
    expect(config.KINDS).toEqual(['api_key', 'jwt']);
  });

  it('still throws for a missing required list', () => {
    expect(() => cleanEnv({}, { KINDS: list() })).toThrow(/KINDS/);
  });
});

describe('num() bounds and int()', () => {
  it('accepts plain numbers like envalid num', () => {
    expect(cleanEnv({ N: '42' }, { N: num() }).N).toBe(42);
    expect(cleanEnv({ N: '3.5' }, { N: num() }).N).toBe(3.5);
    expect(() => cleanEnv({ N: 'abc' }, { N: num() })).toThrow(/N: Invalid number input/);
  });

  it('enforces min/max', () => {
    expect(cleanEnv({ TTL: '0' }, { TTL: num({ min: 0 }) }).TTL).toBe(0);
    expect(() => cleanEnv({ TTL: '-1' }, { TTL: num({ min: 0 }) })).toThrow(
      /TTL: Expected a number >= 0/
    );
    expect(() => cleanEnv({ C: '65' }, { C: num({ min: 1, max: 64 }) })).toThrow(
      /C: Expected a number <= 64/
    );
  });

  it('int() rejects a non-integer count', () => {
    expect(cleanEnv({ C: '8' }, { C: int({ min: 1 }) }).C).toBe(8);
    expect(() => cleanEnv({ C: '1.5' }, { C: int() })).toThrow(/C: Expected an integer/);
  });

  it('resolves a default when unset (envalid returns defaults unvalidated)', () => {
    expect(cleanEnv({}, { TTL: num({ min: 0, default: 30_000 }) }).TTL).toBe(30_000);
  });
});

describe('duration()', () => {
  it('normalizes suffixed values to milliseconds', () => {
    const spec = { D: duration() };
    expect(cleanEnv({ D: '250' }, spec).D).toBe(250);
    expect(cleanEnv({ D: '500ms' }, spec).D).toBe(500);
    expect(cleanEnv({ D: '30s' }, spec).D).toBe(30_000);
    expect(cleanEnv({ D: '5m' }, spec).D).toBe(300_000);
    expect(cleanEnv({ D: '2h' }, spec).D).toBe(7_200_000);
    expect(cleanEnv({ D: '1d' }, spec).D).toBe(86_400_000);
  });

  it('rejects garbage and negatives', () => {
    expect(() => cleanEnv({ D: '30 years' }, { D: duration() })).toThrow(
      /D: Invalid duration input/
    );
    expect(() => cleanEnv({ D: '-5s' }, { D: duration() })).toThrow(/D: Expected a number >= 0/);
  });

  it('takes a plain millisecond default', () => {
    expect(cleanEnv({}, { D: withDefault(duration, 30_000) }).D).toBe(30_000);
  });
});

describe('enumerated()', () => {
  it('accepts a member and types the union', () => {
    const mode = cleanEnv(
      { MODE: 'combined' },
      { MODE: enumerated(['per-function', 'combined'] as const) }
    ).MODE;
    const typed: 'per-function' | 'combined' = mode;
    expect(typed).toBe('combined');
  });

  it('rejects a non-member', () => {
    expect(() =>
      cleanEnv({ MODE: 'sideways' }, { MODE: enumerated(['per-function', 'combined'] as const) })
    ).toThrow(/MODE: Value "sideways" not in choices \[per-function, combined\]/);
  });

  it('oneOf is an alias', () => {
    expect(oneOf).toBe(enumerated);
  });
});

describe('cross-field checks', () => {
  it('reports a failed check in the same consolidated error', () => {
    expect(() =>
      env(
        { SOURCE_DATABASE: 'app', TARGET_DATABASE: 'app' },
        {},
        { SOURCE_DATABASE: str(), TARGET_DATABASE: str() },
        {
          checks: [
            distinct(
              ['SOURCE_DATABASE', 'TARGET_DATABASE'],
              'must be different databases'
            )
          ]
        }
      )
    ).toThrow(/SOURCE_DATABASE, TARGET_DATABASE: must be different databases/);
  });

  it('passes when the constraint holds', () => {
    const config = env(
      { SOURCE_DATABASE: 'app', TARGET_DATABASE: 'app_copy' },
      {},
      { SOURCE_DATABASE: str(), TARGET_DATABASE: str() },
      { checks: [distinct(['SOURCE_DATABASE', 'TARGET_DATABASE'])] }
    );
    expect(config.SOURCE_DATABASE).toBe('app');
  });

  it('is skipped when a var it names already failed (no "both equal" noise)', () => {
    let error: Error | undefined;
    try {
      env(
        {},
        {},
        { SOURCE_DATABASE: str(), TARGET_DATABASE: str() },
        { checks: [distinct(['SOURCE_DATABASE', 'TARGET_DATABASE'], 'must be different databases')] }
      );
    } catch (err) {
      error = err as Error;
    }
    expect(error?.message).toMatch(/SOURCE_DATABASE/);
    expect(error?.message).not.toMatch(/must be different databases/);
  });

  it('sees cleaned, coerced values', () => {
    expect(() =>
      env(
        {},
        {},
        { MIN: num({ default: 10 }), MAX: num({ default: 5 }) },
        {
          checks: [
            {
              vars: ['MIN', 'MAX'],
              check: (v: { MIN: number; MAX: number }) => v.MIN <= v.MAX,
              message: 'MIN must not exceed MAX'
            }
          ]
        }
      )
    ).toThrow(/MIN must not exceed MAX/);
  });

  it('mutuallyExclusive allows at most one', () => {
    const specs = { A: str({ default: undefined }), B: str({ default: undefined }) };
    const options = { checks: [mutuallyExclusive(['A', 'B'])] };
    expect(env({ A: 'x' }, {}, specs, options).A).toBe('x');
    expect(() => env({ A: 'x', B: 'y' }, {}, specs, options)).toThrow(
      /only one of A, B may be set/
    );
  });

  it('requiredWhen turns a flag into requirements', () => {
    const specs = {
      TLS: str({ default: undefined }),
      TLS_CERT: str({ default: undefined })
    };
    const options = { checks: [requiredWhen('TLS', ['TLS_CERT'])] };
    expect(env({}, {}, specs, options).TLS).toBeUndefined();
    expect(() => env({ TLS: '1' }, {}, specs, options)).toThrow(
      /TLS_CERT are required when TLS is set/
    );
  });

  it('a throwing check fails instead of escaping', () => {
    expect(() =>
      env(
        { A: 'x' },
        {},
        { A: str() },
        {
          checks: [
            {
              vars: ['A'],
              check: () => {
                throw new Error('boom');
              },
              message: 'check blew up'
            }
          ]
        }
      )
    ).toThrow(/A: check blew up/);
  });
});

describe('secret redaction', () => {
  const SECRET_URL = 'not a url, and it has hunter2 in it';

  it('never prints the value of a var declared in secrets', () => {
    let message = '';
    try {
      env({ DATABASE_URL: SECRET_URL }, { DATABASE_URL: url() });
    } catch (err) {
      message = (err as Error).message;
    }
    expect(message).toMatch(/DATABASE_URL: Invalid url/);
    expect(message).toMatch(/value redacted, \d+ chars/);
    expect(message).not.toContain('hunter2');
  });

  it('honors { secret: true } for a var declared in vars', () => {
    let message = '';
    try {
      env({ API_KEY: SECRET_URL }, {}, { API_KEY: url({ secret: true }) });
    } catch (err) {
      message = (err as Error).message;
    }
    expect(message).toMatch(/API_KEY: Invalid url/);
    expect(message).not.toContain('hunter2');
  });

  it('keeps the "how to fix" message for a MISSING secret (no value to leak)', () => {
    let message = '';
    try {
      env({}, { DATABASE_URL: url({ desc: 'the primary connection string' }) });
    } catch (err) {
      message = (err as Error).message;
    }
    expect(message).toMatch(/DATABASE_URL: the primary connection string/);
    expect(message).not.toMatch(/value redacted/);
  });

  it('does not redact non-secret vars', () => {
    let message = '';
    try {
      env({ PUBLIC_URL: 'nope' }, {}, { PUBLIC_URL: url() });
    } catch (err) {
      message = (err as Error).message;
    }
    expect(message).toContain('"nope"');
  });

  it('redacts secrets from the cleaned env when it is serialized', () => {
    const config = env(
      { DATABASE_URL: 'postgres://user:hunter2@localhost/db' },
      { DATABASE_URL: url() },
      { PORT: num({ default: 3000 }) }
    );

    // property access still returns the real value
    expect(config.DATABASE_URL).toBe('postgres://user:hunter2@localhost/db');
    const serialized = JSON.stringify(config);
    expect(serialized).not.toContain('hunter2');
    expect(serialized).toContain('[redacted]');
    expect(JSON.parse(serialized).PORT).toBe(3000);
  });

  it('redacts secrets from util.inspect (console.log of the config)', () => {
    const config = env(
      { DATABASE_URL: 'postgres://user:hunter2@localhost/db' },
      { DATABASE_URL: url() },
      { PORT: num({ default: 3000 }) }
    );
    const inspected = inspect(config);
    expect(inspected).not.toContain('hunter2');
    expect(inspected).toContain('[redacted]');
  });

  it('leaves a non-secret config serializable as before', () => {
    const config = env({ PUBLIC_URL: 'https://example.com' }, {}, { PUBLIC_URL: url() });
    expect(JSON.stringify(config)).toBe('{"PUBLIC_URL":"https://example.com"}');
  });

  it('redactEnvError scrubs quoted values and known secrets', () => {
    const redacted = redactEnvError(new Error('Invalid url: "postgres://u:pw@h/db"'));
    expect(redacted.message).toBe('Invalid url: "[redacted]"');

    const custom = redactEnvError(new Error('could not connect with hunter2'), ['hunter2']);
    expect(custom.message).toBe('could not connect with [redacted]');

    const untouched = new Error('nothing to redact');
    expect(redactEnvError(untouched)).toBe(untouched);
  });
});

describe('value-shape validators (shared with @constructive-io/coerce)', () => {
  it('accepts the shapes each one names', () => {
    const config = cleanEnv(
      {
        PORT: '5432',
        API_URL: 'https://api.constructive.io',
        PGHOST: 'db.internal',
        SUPPORT_EMAIL: 'developers@constructive.io',
        TENANT_ID: '3f2504e0-4f89-11d3-9a0c-0305e82c3301'
      },
      {
        PORT: port(),
        API_URL: url(),
        PGHOST: host(),
        SUPPORT_EMAIL: email(),
        TENANT_ID: uuid()
      }
    );
    expect(config.PORT).toBe(5432);
    expect(config.API_URL).toBe('https://api.constructive.io');
    expect(config.PGHOST).toBe('db.internal');
    expect(config.SUPPORT_EMAIL).toBe('developers@constructive.io');
    expect(config.TENANT_ID).toBe('3f2504e0-4f89-11d3-9a0c-0305e82c3301');
  });

  it('throws on a port outside 1..65535 rather than booting on it', () => {
    expect(() => cleanEnv({ PORT: '65536' }, { PORT: port() })).toThrow(/PORT/);
    expect(() => cleanEnv({ PORT: 'http' }, { PORT: port() })).toThrow(/PORT/);
  });

  it('throws on a scheme-less url and a host carrying a port', () => {
    expect(() => cleanEnv({ API_URL: 'api.constructive.io' }, { API_URL: url() })).toThrow(/API_URL/);
    expect(() => cleanEnv({ PGHOST: 'db.internal:5432' }, { PGHOST: host() })).toThrow(/PGHOST/);
  });

  it('throws on a malformed email and a truncated uuid', () => {
    expect(() => cleanEnv({ SUPPORT_EMAIL: 'developers' }, { SUPPORT_EMAIL: email() })).toThrow(
      /SUPPORT_EMAIL/
    );
    expect(() => cleanEnv({ TENANT_ID: '3f2504e0' }, { TENANT_ID: uuid() })).toThrow(/TENANT_ID/);
  });

  it('resolves a typed default through the same coercion', () => {
    const config = cleanEnv({}, { PORT: port({ default: 3000 }) });
    expect(config.PORT).toBe(3000);
  });
});
