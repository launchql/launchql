# 12factor-env

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
  <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE">
    <img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
  </a>
  <a href="https://www.npmjs.com/package/12factor-env">
    <img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=packages%2F12factor-env%2Fpackage.json"/>
  </a>
</p>

> Environment variable validation for 12-factor apps

A TypeScript library for validating environment variables. Built on top of [envalid](https://github.com/af/envalid).

## Installation

```bash
npm install 12factor-env
```

## Usage

```ts
import { env, str, num, bool, port, email, host } from '12factor-env';

const config = env(
  process.env,
  {
    // Required environment variables
    DATABASE_URL: str(),
    API_KEY: str()
  },
  {
    // Optional environment variables with defaults
    PORT: port({ default: 3000 }),
    DEBUG: bool({ default: false }),
    LOG_LEVEL: str({ default: 'info' })
  }
);

console.log(config.DATABASE_URL); // Validated string
console.log(config.PORT);         // Validated number
```

## Fallback classes: `withDefault` / `devDefault` / `required`

The real question for any config value is not "optional vs required" but
**"is there an honest fallback?"**. These thin wrappers over any envalid
validator make that intent explicit at the declaration site:

```ts
import { env, str, url, withDefault, devDefault, required } from '12factor-env';

const config = env(process.env, {}, {
  // Class 1 — honest fallback in every environment (ports, timeouts, flags)
  JOBS_SCHEMA:              withDefault(str, 'app_jobs'),

  // Class 2 — fallback in dev/test, but REQUIRED (throws) in production.
  // A localhost base domain is fine locally, a bug in prod.
  SYNC_GATEWAY_BASE_DOMAIN: devDefault(str, 'sync.localhost'),

  // Class 3 — no honest fallback; throws in every environment when absent.
  K8S_API_URL:             required(url)
});
```

| Wrapper | unset in dev/test | unset in production | env value present |
|---------|-------------------|---------------------|-------------------|
| `withDefault(v, x)` | uses `x` | uses `x` | uses env value |
| `devDefault(v, x)`  | uses `x` | **throws** | uses env value |
| `required(v)`       | **throws** | **throws** | uses env value |

### House `NODE_ENV` semantics

`devDefault` is enforced in production. Crucially, envalid natively treats an
**unset** `NODE_ENV` as production — which would make `devDefault` throw during
ordinary local development where nobody sets `NODE_ENV`. This library normalizes
`NODE_ENV` first (without mutating the caller's environment) so:

- explicit `production` → `production`
- explicit `test`/`testing`, or `GITHUB_ACTIONS=true` → `test`
- anything else, **including unset** → `development`

The same logic is exported as helpers:

```ts
import { getNodeEnv, isProduction, isTest, isDevelopment } from '12factor-env';

getNodeEnv();        // 'development' | 'production' | 'test'
isProduction();      // boolean
```

### Lenient coercion

Envalid's built-in `bool` rejects values like `TRUE` or `yes`. `boolish` accepts
`true`/`1`/`yes` case-insensitively (and is safe to combine with a boolean
default). The underlying coercion helpers are also exported:

```ts
import { env, boolish, withDefault, parseEnvBoolean, parseEnvNumber } from '12factor-env';

const config = env(process.env, {}, {
  FEATURE_ENABLED: withDefault(boolish, false)   // accepts TRUE/yes/1
});

parseEnvBoolean('YES'); // true
parseEnvNumber('42');   // 42
```

## Opt-in dotenv support (`12factor-env/dotenv`)

The 12-factor rule is **environment first, `.env` as a local-dev convenience**.
`dotenv()` builds an environment record where a local `.env` fills gaps but real
environment variables always win. It never mutates `process.env`, a missing file
is not an error, and nothing changes unless you call it — existing `env()` usage
is unaffected.

It lives in its own **node-only** entry point, because it imports `node:fs`. The
main `12factor-env` entry stays free of node builtins so it can be bundled for a
browser, an Electron renderer, or a Next.js client component:

```ts
import { env, str, port } from '12factor-env';
import { dotenv } from '12factor-env/dotenv';   // node only

const config = env(
  dotenv(),                       // process.env, backed by ./.env when present
  { DATABASE_URL: str() },
  { PORT: port({ default: 3000 }) }
);
```

In a client/renderer bundle, keep importing only from `12factor-env` and pass
whatever environment record the framework gives you (`process.env` as inlined by
Next/Vite, or values the main process forwarded over IPC) — `env()` validates any
record, so nothing needs to read a file:

```ts
import { env, str } from '12factor-env';

const config = env({ NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL }, {
  NEXT_PUBLIC_API_URL: str()
});
```

Options:

```ts
dotenv();                                  // <cwd>/.env merged under process.env
dotenv({ cwd: projectDir });               // look for .env in another directory
dotenv({ file: '.env.local' });            // different file name under cwd
dotenv({ path: '/etc/app/config.env' });   // explicit file path
dotenv({ environment: {} });               // file only, ignore process.env
dotenv({ override: true });                // file values win over the environment
```

Parsing uses Node's built-in dotenv parser (`util.parseEnv`), which handles
comments, quoting, and `export` prefixes. The raw parser is exported as
`parseDotenv(source)` if you need it directly.

## The contract: unset may default, invalid always throws

Two different things, deliberately:

- **Unset** — resolves `default`/`devDefault`/`testDefault` if the spec has one, otherwise throws.
- **Set but invalid** — **always throws.** A value that is present and wrong is never
  silently replaced by a default or a fallback, because a typo'd `AUTH_KINDS` degrading
  to "allow nothing" (or a bad `PORT` degrading to 3000) is a security incident, not a
  recovery. This is why `list()` treats "set, but yields no items" as an error rather
  than returning `[]`.

Errors from one `env()` call are reported **together**, including cross-field `checks`,
so an operator fixes one deployment instead of one variable per redeploy.

## Validators

All validators from [envalid](https://github.com/af/envalid) are re-exported:

| Validator | Description |
|-----------|-------------|
| `str()` | String value |
| `bool()` | Boolean (`true`, `false`, `1`, `0`) |
| `num()` | Number |
| `port()` | Port number (1-65535) |
| `host()` | Hostname or IP address |
| `url()` | Valid URL |
| `email()` | Valid email address |
| `json()` | JSON string (parsed) |

House validators add what consumers were otherwise hand-rolling after `env()`:

| Validator | Description |
|-----------|-------------|
| `list()` | Separated list of trimmed, non-empty strings. `list({ separator: ':' })`, and `list({ choices: [...] as const })` checks membership **per item** and types the result as the union array |
| `num({ min, max, integer })` | Number with inclusive bounds (superset of envalid's `num`) |
| `int({ min, max })` | `num({ integer: true })` |
| `duration()` | Milliseconds, accepting `250`, `500ms`, `30s`, `5m`, `2h`, `1d` |
| `enumerated([...] as const)` / `oneOf` | `str({ choices })` with a discoverable name and literal-union typing |

```ts
import { duration, enumerated, env, int, list, str } from '12factor-env';

const config = env(process.env, {}, {
  AUTH_KINDS: list({ choices: ['api_key', 'jwt'] as const, default: ['api_key'] }),
  CACHE_TTL: duration({ default: 30_000 }),
  POOL_MAX: int({ min: 1, max: 64, default: 10 }),
  CODEGEN_MODE: enumerated(['per-function', 'combined'] as const, { default: 'combined' })
});
```

## Cross-field checks

Constraints *between* vars belong in the schema, not in an ad-hoc `if` after it — that
way they run against cleaned values and their failures join the same report:

```ts
import { distinct, env, mutuallyExclusive, requiredWhen, str } from '12factor-env';

const config = env(process.env, { SOURCE_DATABASE: str(), TARGET_DATABASE: str() }, {}, {
  checks: [
    distinct(['SOURCE_DATABASE', 'TARGET_DATABASE'], 'source and target databases must differ'),
    mutuallyExclusive(['AUTH_TOKEN', 'AUTH_TOKEN_FILE']),
    requiredWhen('TLS_ENABLED', ['TLS_CERT', 'TLS_KEY']),
    { vars: ['MIN', 'MAX'], check: (v) => v.MIN <= v.MAX, message: 'MIN must not exceed MAX' }
  ]
});
```

A check is **skipped** when any var it names already failed validation, so "both unset"
is not also reported as "both equal".

## Secrets are not printed

envalid quotes the offending value into its message (`Invalid url: "postgres://u:pw@h/db"`),
which puts passwords in crash logs. Anything passed as `env()`'s `secrets` argument — or
marked `str({ secret: true })` — is redacted instead:

```ts
const config = env(process.env, { DATABASE_URL: url() }, { PORT: port({ default: 3000 }) });

config.DATABASE_URL          // the real value
JSON.stringify(config)       // {"DATABASE_URL":"[redacted]","PORT":3000}
console.log(config)          // redacted too (util.inspect)

// a malformed DATABASE_URL reports: 'Invalid url: "[redacted]" (value redacted, 42 chars)'
// a MISSING one still reports its desc, since there is no value to leak
```

Use `redactEnvError(err, [knownSecret])` when re-logging an error you built yourself.

### Validator Options

All validators accept options:

```ts
import { str, num } from '12factor-env';

const config = env(process.env, {
  API_KEY: str({ desc: 'API key for external service' }),
  TIMEOUT: num({ default: 5000, desc: 'Request timeout in ms' })
});
```

## API

### `env(inputEnv, secrets, vars, options?)`

Main function to validate environment variables.

- `inputEnv` - The environment object (usually `process.env`)
- `secrets` - Required environment variables (treated as sensitive: redacted in errors and serialization)
- `vars` - Optional environment variables
- `options.checks` - Constraints between vars, evaluated over the cleaned values

## Re-exports from envalid

The following are re-exported from envalid for convenience:

- `cleanEnv` - Low-level env cleaning function
- `makeValidator` - Create custom validators
- `EnvError` - Error class for validation errors
- `EnvMissingError` - Error class for missing required vars
- `testOnly` - Helper for test-only defaults
