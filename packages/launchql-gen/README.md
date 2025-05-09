# launchql-gen

<p align="center" width="100%">
  <img height="120" src="https://github.com/launchql/pgsql-parser/assets/545047/6440fa7d-918b-4a3b-8d1b-755d85de8bea" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql-2.0/blob/main/LICENSE-MIT"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/launchql-gen"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql-2.0?filename=packages%2Flaunchql-gen%2Fpackage.json"/></a>
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
