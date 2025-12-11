# launchql-gen

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/launchql-gen"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=packages%2Flaunchql-gen%2Fpackage.json"/></a>
</p>

Generate GraphQL mutations/queries

```sh
npm install launchql-gen
```

## introspecting via GraphQL

```js
import {
  generate
} from 'launchql-gen';
import { print } from 'graphql/language';

const gen = generate(resultOfIntrospectionQuery);
const output = Object.keys(gen).reduce((m, key) => {
  m[key] = print(gen[key].ast);
  return m;
}, {});

console.log(output);
```

# output

which will output the entire API as an object with the mutations and queries as values

```json
{
  "createApiTokenMutation": "mutation createApiTokenMutation($id: UUID, $userId: UUID!, $accessToken: String, $accessTokenExpiresAt: Datetime) {
  createApiToken(input: {apiToken: {id: $id, userId: $userId, accessToken: $accessToken, accessTokenExpiresAt: $accessTokenExpiresAt}}) {
    apiToken {
      id
      userId
      accessToken
      accessTokenExpiresAt
    }
  }
}
```

## Codegen (types, operations, SDK, React Query)

Programmatic codegen generates files to disk from a schema SDL file or from a live endpoint via introspection.

```js
import { runCodegen, defaultLaunchQLGenOptions } from '@launchql/codegen'

await runCodegen({
  input: { schema: './schema.graphql' }, // or: { endpoint: 'http://localhost:3000/graphql', headers: { Host: 'meta8.localhost' } }
  output: defaultLaunchQLGenOptions.output, // root/typesFile/operationsDir/sdkFile/reactQueryFile
  documents: defaultLaunchQLGenOptions.documents, // format: 'gql'|'ts', naming convention
  features: { emitTypes: true, emitOperations: true, emitSdk: true, emitReactQuery: true },
  reactQuery: { fetcher: 'graphql-request' }
}, process.cwd())
```

Outputs under `output.root`:
- `types/generated.ts` (schema types)
- `operations/*` (queries/mutations/Fragments)
- `sdk.ts` (typed GraphQL Request client)
- `react-query.ts` (typed React Query hooks; generated when `emitReactQuery: true`)

Documents options:
- `format`: `'gql' | 'ts'`
- `convention`: `'dashed' | 'underscore' | 'camelcase' | 'camelUpper'`
- `allowQueries`, `excludeQueries`, `excludePatterns` to control which root fields become operations

Endpoint introspection:
- Set `input.endpoint` and optional `input.headers`
- If your dev server routes by hostname, add `headers: { Host: 'meta8.localhost' }`
