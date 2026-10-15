# Graphile performance harness

Reusable infrastructure for measuring Graphile schema builds in fresh Node
processes. The core accepts any list of serializable benchmark cases; it does not
interpret case names or optimization-specific configuration.

Each measurement receives a new PID, starts Node with `--expose-gc`, runs a
deterministic GC sequence, records build time and memory metrics, validates a
runtime query, and reports a schema hash. Cases can opt into schema equivalence
groups and provide their own lifecycle validation through the worker result.

## Running locally

Build the package, then invoke its local CLI script from the workspace root:

```sh
pnpm --filter @constructive-io/perf-harness build
pnpm --filter @constructive-io/perf-harness cperf prepare \
  --database-url 'postgresql:///benchmark' \
  --schema cperf_example --tables 4
```

Use an existing local benchmark database. The equivalent direct CLI entry is
`node packages/perf-harness/dist/cli.js`; pass `run` with the suite's `--cases`
and `--worker` arguments to execute measurements.

`makage` assembles the package in `dist`, where `index.js` is the CommonJS library
entry, `esm/index.js` is the ESM library entry for bundlers, and `cli.js` is the
`cperf` executable. The package manifest's entry paths are relative to that
artifact directory. The private workspace package uses the local `cperf` script
above. Importing either library entry does not start the CLI.

`pnpm --filter @constructive-io/perf-harness test` rebuilds the package before
running unit tests and smoke tests against the generated library and CLI entries.

## Extending the harness

Define a suite and provide a dedicated worker entry point:

```ts
const suite = {
  name: 'example',
  cases: [
    {
      name: 'baseline',
      workerConfig: { schemas: ['cperf_example'] },
      expectedSchemaGroup: 'example-schema',
    },
  ],
};

await runBenchmarkSuite(suite, options, workerPath);
```

`workerConfig` must be JSON-serializable. Logic is implemented in the worker
entry rather than serializing functions across process boundaries.

Each worker has a five-minute wall-clock deadline, including startup, database
access, validation, and cleanup. Set `options.workerTimeoutMs` or pass
`--worker-timeout-ms` to `cperf run` to override it with a positive integer
(maximum 2,147,483,647 ms). The effective deadline is recorded in `report.config`;
it does not change the build-only `buildMs` measurement.

A timed-out worker is killed and must finish closing before the next case starts.
Its failure is recorded even if it already printed a successful result. If its
process and stdio cannot be confirmed closed within another five seconds, the
suite stops scheduling cases and writes a failed report containing the completed
runs. Earlier successful samples may remain in summaries, but the report's
validation fails. The CLI exits nonzero for either kind of failure.

The package includes `stock-worker.js` as a minimal upstream Graphile baseline.
It emits one result after releasing its Graphile service. A measurement or release
failure fails the run; if both fail, the error report retains both diagnostics in
that order.
The top-level commands require `--database-url`; the runner forwards it and the
opaque case configuration to each short-lived worker as CLI arguments. Database
credentials are redacted from worker failures and JSON reports. This harness is
intended for local development on a trusted machine because command arguments
may be visible to other local processes.

The PostgreSQL fixture command only creates a previously absent schema whose
name starts with `cperf_`; it never drops or replaces schemas.

## Scoped introspection comparison

`makeScopedIntrospectionSuite({ schemas })` compares stock introspection with
`gather.pgScopedIntrospection.main: true` using `scoped-introspection-worker.js`.
Both cases use the same upstream service factory and its default session settings.
The scoped case uses the copied CNC plugin and its default `catalogTypes: 'all'`;
there is no legacy mode, dependency-schema allowlist, or performance-only tuning.
The stock case does not load the scoped plugin.

Pass an optional `runtimeCheck: { query, expectedData }` to the suite to verify
actual table, relation, or function results after each build. A result mismatch
fails the sample. Without this option, the worker performs the minimal
`{ __typename }` smoke check. Schema hash equivalence is checked separately by
the runner. Service release completes before the worker reports success.

For performance comparisons, keep target schemas fixed while increasing unrelated
catalog objects, discard a warm-up pair, and use repeated fresh-process samples
with the runner's seeded case ordering. Fresh Node processes do not imply cold
PostgreSQL caches. Report medians and sample ranges together with PostgreSQL/Node
versions and catalog sizes; runtime validation and process startup are outside
`buildMs`. `processPeakRss` is the worker peak measured after runtime validation,
before service release.

The [default scoped comparison](benchmarks/scoped-introspection.md) records the
historical method, summarized results, limitations, and a reproduction command
for the typed runner. Generated reports and per-sample results stay local.

## Cache capacity experiments

The [Grafast cache suite](benchmarks/grafast-cache/README.md) compares native
cache capacities using this package alone. Run `cache:micro`, `cache:postgres`
and `cache:variants` for in-memory traffic, PostgreSQL confirmation and multiple
plans per operation. TypeScript sources build into `dist` with the rest of the
package; `cache:analyze` validates local raw reports and produces both summaries.
Generated results are not committed. The [PR #1746 description](https://github.com/constructive-io/constructive/pull/1746)
records the measured results and tradeoffs; the suite README contains reproduction
instructions.

## Connection lifecycle stability suite

The TypeScript entry points in `src/connection-lifecycle` exercise the unpatched
PostGraphile service and the real `graphile-cache` lifecycle. Build the workspace
(or `pnpm --filter @constructive-io/perf-harness... build`), then run:

```sh
node packages/perf-harness/dist/connection-lifecycle/suite.js \
  --database-url 'postgresql://postgres:password@localhost:5432/postgres' \
  --output /tmp/graphile-connection-lifecycle.json
```

Use a local PostgreSQL test administrator URL without query parameters. Its
named database is the administrative connection database; `pgsql-test` creates
and tears down a separate test database per worker. The suite defaults to one
fresh-process repetition, one concurrent lifecycle, a two-connection pool, and
`--scale 0.01`: 20 cycles for each service-only case and three cycles for each
Graphile case (72 lifecycles total). This is a low-resource functional check.

For a separate stress run on a suitable machine, pass `--scale 1 --repetitions 3
--concurrency 8`: 2,000 cycles per service-only case, 256 per Graphile case, and a
16-connection pool (21,072 lifecycles total). Concurrency accepts 1–16; the pool
limit is twice concurrency, capped at 16. Each worker retains the harness's
five-minute deadline.

Cases cover idle services, confirmed LISTEN subscriptions, release during
subscription startup, Graphile build/dispose, subscribed build/dispose, failed
schema builds, and replacement of generations using the same cache key. Runtime
GraphQL queries verify the built schema against a real table. Every 64 cycles
(and at the end), the worker separately observes pool quiescence and checks every
remaining backend for LISTEN channels. It also verifies that `pg_stat_activity`
returns to its pre-run baseline after idle expiry, before fixture teardown or
process exit can hide a leak.

A successful public release call is counted immediately; it does not imply that
upstream background UNLISTEN/client return has completed. Reports distinguish
pending connections at return, peak pool size/checkout/waiting counts, cleanup
settlement latency, quiescent checkpoints, and retained client event listeners.
Listener accumulation is reported separately from checked-out connection leaks.
For this suite `buildMs` measures the whole churn loop, including its validation
checkpoints, rather than one
schema build. The failed-build case expects its injected schema errors. Network
partitions, backend termination, and production workload distributions are not
modeled. Keep generated JSON reports outside the repository; commit only the
TypeScript suite and its documentation.
