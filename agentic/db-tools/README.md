# @agentic-kit/db-tools

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@agentic-kit/db-tools"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=agentic%2Fdb-tools%2Fpackage.json"/></a>
</p>

The Constructive typed database tools, as **harness-neutral** [`HarnessTool`](https://www.npmjs.com/package/@agentic-kit/harness)s: zod parameters, `execute(params, { cwd, signal })`, and no coding-agent SDK anywhere in the package. Binding them to a harness is the *adapter's* job — [`@agentic-kit/pi`](https://www.npmjs.com/package/@agentic-kit/pi) does it with `toPiTool()` — so a second, compatible harness registers the same 18 tools without a fork.

```
@agentic-kit/db-tools ──► @agentic-kit/harness (HarnessTool)
        ▲
        ├── @agentic-kit/pi        toPiTool()  ──► pi's ToolDefinition
        └── your adapter           toXTool()   ──► your harness's tool shape
```

```bash
npm install @agentic-kit/db-tools
```

## What's inside

- **18 typed db tools** — `provision_database`, `provision_blueprint`, `describe_schema`, `add_relation`, `delete_table`, `create_field` / `update_field` / `delete_field`, `add_policies`, `add_records`, `manage_entity_types`, `create_api_key`, `run_codegen`, and the template suite (`list` / `create` / `apply` / `update` / `delete`). `constructiveDbTools` is the list, in registration order.
- **Host injection** — credentials, backend endpoints and data-plane tokens come from the host application, not from the package. Call `configureHost()` once at startup; the tools read it lazily per call.
- **Project context** — `resolveProjectContext` / `resolveDataToken` resolve the database a tool acts on from the cwd's `.env` plus the host's session, and `deriveSubdomainEndpoint` derives its per-database endpoints. `probeDatabase` says whether that database is still there, and `readSchemaModel` reads its app tables.
- **Provisioning model** — the pinned `node-type-registry` presets, the provision manifest, and overlay resolution (`resolveProvisionModules`).
- **`constructiveGateDeps`** — the confirm gate's host capabilities (is the project runnable, is there a data token, what tables would a template copy) answered by these resolvers, so every adapter gates the same tools against the same project state instead of restating it.
- **`toolSchema`** — a tool's zod parameters as plain JSON Schema, for adapters whose harness wants JSON Schema rather than zod.

## Usage

```ts
import { configureHost, constructiveDbTools } from '@agentic-kit/db-tools';

configureHost({
  account: () => ({ userId, accessToken }),
  backendConfig: () => ({ apiEndpoint, modulesEndpoint }),
  signInHint: 'Run `agent login` to sign in.'
});

for (const tool of constructiveDbTools) {
  myHarness.registerTool(myToolBinding(tool));
}
```

A tool executes against nothing but its params and a context, so it is callable directly — which is also how the tests drive it:

```ts
const result = await describeSchemaTool.execute({ database_name: 'my-app' }, { cwd: process.cwd() });
```

## Is the bound database still there?

`probeDatabase` (or `probeBoundDatabase(id)`, which uses the host's account and control endpoint) asks the platform api and returns one of:

| `status` | Means | Recovery |
| --- | --- | --- |
| `found` | Live; carries `name`, `ownerId` and `hash` (the schema hash, which changes on every schema change) | none |
| `suspended` | It exists and keeps its data, but is held (`suspendedAt`, `suspendedReason`) | wait for the hold to lift; never replace it |
| `missing` | The backend answered and this account can't see it: deleted, or access lost | re-provision |
| `unreachable` | No usable answer; `cause` is `network`, `server`, `auth` (account credential rejected) or `error` (an error the probe doesn't know) | retry or sign in; never re-provision |

Only `missing` means the database is gone. On a backend without `hash`, the probe retries once without it and `hash` is undefined. `resolveProjectContext` reports the same states as `db-missing`, `db-suspended`, `account-mismatch` and `backend-unreachable` (with `cause`), and a resolved context carries `hash`.

Tenant APIs answer `ACCESS_SUSPENDED` (a 403 with a JSON body) for a deleted or suspended database. The SDK's `FetchAdapter` drops that body, so `postGraphQL` and `statusAdapter` (a drop-in ORM adapter) keep each error's `extensions.code` and HTTP status, and `classifyBackendErrors` sorts them into `suspended`, `network`, `server`, `auth`, `forbidden` or `graphql`. `add_records`, `run_codegen` and `create_api_key` return `details.code: 'database-unavailable'` on `ACCESS_SUSPENDED`, and `run_codegen` doesn't retry a refused introspection.

## The live schema

`readSchemaModel(context)` reads the app tables (category `APP`, whoever created them) from the metaschema in one piece, or throws `SchemaReadError`; a partial read would look like columns dropped outside. Each table has its stable metaschema id, every field with its category (a status column made by `DataStatusField` is `MODULE`), a normalised type, `isRequired`, a structured default (`value`, `now`, `today`, `generated` or `expression`), the values an IN-list check allows, primary-key and unique flags, foreign keys with their delete and update actions (targets outside the app tables still resolve), and its policies. `accessOf(policies)` maps them to `shared`, `private` or `custom`. The model's `hash` is read before anything else.

## Provisioning

`provision_database` and the host-side `provisionDatabase(input, { cwd })` never create a second database by accident. Calls for one project run one at a time. A binding is `DATABASE_ID` alone: it is probed, then kept (healing the token, endpoints and any missing keys) or refused. Replace mode (`mode: 'replace', replaces: <the id the caller saw>`) swaps the binding only if it is still that one, and never swaps a suspended database, or a live one on the host path. A provision that outlasts the poll is recorded in `.env` and resumed by the next call. A ticket that can't be read back, or a call that lost track of its ticket, finds an in-flight provision of the same name with `listOwn` before anything is requested; a completed one is only reported. After `MAX_PENDING_ATTEMPTS` waits the call fails `provision-stuck` until the host passes `abandonPending`.

Failures carry a `code`: `signed-out`, `backend-unreachable`, `db-missing`, `db-suspended`, `account-mismatch`, `binding-live`, `binding-changed`, `pending-other`, `ticket-lost`, `provision-stuck`, `name-taken` (with `heldBy` when a database of this account holds the name, which the host can bind with `adopt: <id>`), `binding-not-saved`, `env-write-failed`, `reprovision-not-allowed` or `failed`.

Host hooks for this, all optional:

- `persistBinding(binding)` saves the binding in the host's own store before `.env` is written. If it throws, `.env` is left alone, the ticket stays recorded, and the call fails `binding-not-saved`.
- `toolReprovision: false` makes the tool's `reprovision: true` fail `reprovision-not-allowed`, for a host that replaces databases only after the user approves.
- `reprovisionHint` replaces the "re-provision with `reprovision: true`" advice in failure messages.

## Blueprint builds

`constructBlueprint` queues the build and returns the construction id, and the backend builds one blueprint at a time. So `provision_blueprint`, `add_relation` and `apply_template` wait for their build through `buildBlueprint` (or `waitForConstruction`, given an id), which reads the construction every 2 s until it is `constructed`, and returns its table map, or `failed`, and throws with the backend's error code and message. The error is read in a separate query after the failure, so the status reads also work on a backend without the `error` column, and there the failure says the backend gave no reason. A host that polls on its own reads the reason the same way with `readConstructionFailure`. On a backend that still builds inside the mutation, the first read already says `constructed`.

The wait gives up after `CONSTRUCTION_DEADLINE_MS` (240 s: the build's own 120 s statement timeout, plus as long again in the queue), when the signal aborts, or when the status can't be read (a GraphQL error, or 3 network failures in a row), and says the build may still finish. A host that limits how long a tool runs should give these three tools more than 240 s.

## Related

| Package | Role |
| --- | --- |
| [`@agentic-kit/harness`](https://www.npmjs.com/package/@agentic-kit/harness) | the neutral contracts: `HarnessTool`, `HarnessAdapter`, the run gate |
| [`@agentic-kit/pi`](https://www.npmjs.com/package/@agentic-kit/pi) | the pi adapter: binds these tools and attaches a run's lanes to a pi session |
| [`@agentic-kit/cli`](https://www.npmjs.com/package/@agentic-kit/cli) | the `agent` CLI, which materializes the tools into a pi agent dir |
