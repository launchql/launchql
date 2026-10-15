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
- **Project context** — `resolveProjectContext` / `resolveDataToken` resolve the database a tool acts on from the cwd's `.env` plus the host's session, and `deriveSubdomainEndpoint` derives its per-database endpoints.
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

## Requests

Every backend request of a tool call goes through `createBackendFetch` (see `src/backend-fetch.ts`). The rules are the same for each request:

- **Abort** — the request obeys `ctx.signal`. When the signal aborts, the call stops at once, also during a wait between retries.
- **Timeout** — one request stops after 30 s (`REQUEST_TIMEOUT_MS`). A request that times out does not retry.
- **Retries** — a network error or a 502, 503, or 504 response retries up to 3 times (`MAX_RETRIES`). The wait starts at 500 ms, doubles for each retry, and has random jitter.
- **Writes** — a `mutation` retries only when the connection did not open (for example `ECONNREFUSED`). The server did not get the request, so a second send is safe.
- **Progress** — each retry sends "Retrying 1/3" through `ctx.onProgress`, if the host gives one.

`provision_database` and `provision_blueprint` have a limit of 5 min for the full call (`PROVISION_TIMEOUT_MS`). The ticket polls of `provision_database` keep the 30 s limit. `run_codegen` stops its child processes when the signal aborts.

To send your own request with the same rules, use `toolFetch(ctx)`:

```ts
const fetch = toolFetch(ctx);
const response = await fetch(endpoint, { method: 'POST', body: JSON.stringify({ query }) });
```

## Related

| Package | Role |
| --- | --- |
| [`@agentic-kit/harness`](https://www.npmjs.com/package/@agentic-kit/harness) | the neutral contracts: `HarnessTool`, `HarnessAdapter`, the run gate |
| [`@agentic-kit/pi`](https://www.npmjs.com/package/@agentic-kit/pi) | the pi adapter: binds these tools and attaches a run's lanes to a pi session |
| [`@agentic-kit/cli`](https://www.npmjs.com/package/@agentic-kit/cli) | the `agent` CLI, which materializes the tools into a pi agent dir |
