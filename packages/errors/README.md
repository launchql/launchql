# @constructive-io/errors

Canonical Constructive error system. Zero runtime dependencies — usable by any
service or client without pulling in pgpm.

- **Registry** — the single source of truth mapping each stable `code` to its
  classification (`public` vs `internal`), HTTP hint, and default message.
- **`parse(anyError)`** — normalize an error from any source (a
  `ConstructiveError`, a node-postgres `DatabaseError`, a GraphQL error or
  `{ errors: [...] }` wrapper, a plain `Error`, or a string) into a canonical
  `{ code, context, class, known, explicitClass? }`.
- **`format(code, context, locale)`** — render a localized, interpolated
  message. `{{var}}` placeholders + registerable per-locale catalogs (i18n).
- **`errors.*` factory** — type-safe throwable builders derived from the
  registry, e.g. `throw errors.MODULE_NOT_FOUND({ name })`.
- **`classify(code)`** — `public` or `internal`; unknown codes are `internal`
  (fail safe) so transports never leak unregistered errors.
- **`httpStatusFor(code)`** — the canonical code → HTTP status mapping, so no
  transport keeps its own table. Unregistered codes answer `500` *and are
  reported*, never silently.

```ts
import { parse, format, errors, classify } from '@constructive-io/errors';

// Normalize a DB error surfaced through GraphQL
const parsed = parse(graphqlError);
if (parsed.class === 'public') {
  showUser(format(parsed.code!, parsed.context, locale));
}

// Throw a structured error
throw errors.ACCOUNT_EXISTS();
```

## Design notes

- The machine `code` is deliberately separate from user-facing copy so codes
  are stable and messages are localizable.
- `parse()` recovers structure from the code's precedence: structured `DETAIL`
  JSON → GraphQL `extensions.code` → a leading ALL_CAPS token in the message
  (legacy DB `RAISE`, incl. `CODE (arg, arg)` positional args) → native
  SQLSTATE constraint mapping.
- The registry has two layers, merged at lookup time (curated wins):
  - **Generated** (`src/generated/registry.generated.ts`) — every code raised via
    `EXCEPTION`/`THROW` across constructive-db (deploy sources + generated output),
    each with a `public`/`internal` class, HTTP hint, and default message.
  - **Curated** (`src/registry.ts`) — refined, typed-context entries for the codes
    that matter most (public auth/limit copy, native PostgreSQL constraint codes,
    pgpm CLI codes). These override the generated entries.
- Unregistered codes still `parse()` and are classified `internal` (masked).

## Producer classification

`parse()` keeps its existing classification policy: a valid producer class wins,
then the registry is consulted, and unknown codes default to internal.
`explicitClass` is additional metadata, present only when the parser actually
used a valid producer classification from `ConstructiveError.errorClass`,
PostgreSQL `DETAIL.class`, or GraphQL `extensions.class` (including request
wrappers). Missing or invalid producer classes do not populate it. The existing
code-selection precedence also governs which transport's class can be used.

```ts
import { parse } from '@constructive-io/errors';

const parsed = parse({ message: 'STORAGE_PROCESSING_CONFLICT' });
parsed.class; // 'public', from the registry
parsed.explicitClass; // undefined

// An adapter can retain its own internal default for undeclared classifications
// without duplicating the DETAIL or GraphQL parser.
const adapterClass = parsed.explicitClass ?? 'internal';
```

This describes the **immediate input**. A canonical error is authoritative for
its class, including errors created by registry
factories or `toError()`. To distinguish the raw producer's class from a registry
fallback, inspect `parse(caught)` before normalizing it with `toError()`.

## HTTP status

Every registry entry carries `http`, so an HTTP surface never needs its own
code → status table: `toError(err).http`, or `httpStatusFor(code)` when all you
have is a code.

```ts
import { httpStatusFor, setUnmappedStatusReporter, toError } from '@constructive-io/errors';

setUnmappedStatusReporter(code => log.warn({ code }, 'error code has no HTTP status'));

const err = toError(caught);
res.status(err.http).json(err.toExtensions());

httpStatusFor('ACCOUNT_DISABLED'); // { status: 403, mapped: true }
httpStatusFor('BRAND_NEW_CODE');   // { status: 500, mapped: false } + one report
```

`mapped: false` is the one case where a 500 does not mean "the server broke" —
it means the code never reached the registry. That is the failure mode this
exists to make loud: a refusal that is plainly a 403 or a 409 answering 500
looks like a crash, and the codes most likely to be missing are the newest ones.
When a constructive-db release adds codes, refresh the registry (below);
`__tests__/registry-sync.test.ts` fails if the snapshot and the generated
registry disagree.

## Regenerating the full registry

The generated layer is produced from a committed audit snapshot:

```bash
# 1. re-audit constructive-db (refreshes scripts/db-error-inventory.json)
CONSTRUCTIVE_DB_DIR=~/repos/constructive-db python3 scripts/audit-db-errors.py
# 2. regenerate src/generated/registry.generated.ts from the snapshot
python3 scripts/generate-registry.py
```

`audit-db-errors.py` scans every `EXCEPTION`/`THROW` across constructive-db deploy
sources and generated output and writes `scripts/db-error-inventory.json` (the
committed audit snapshot). It also captures the authoritative `public`/`internal`
class from each canonical `errors.raise_error('CODE', context, 'class')` call — the
database is the source of truth for classification, so an explicit class is trusted
directly; codes without one (e.g. single-arg calls relying on the helper default, or
legacy `RAISE EXCEPTION`) fall back to a name-based heuristic.
`generate-registry.py` reads that snapshot and, when a
`constructive-io/dashboard` checkout is found (via `DASHBOARD_DIR` or a sibling
`../dashboard`), seeds public copy from its error catalogs. Re-run both whenever
constructive-db error codes change. Never hand-edit the generated file.
