# launchql-gen

<p align="center" width="100%">
    <img src="https://github.com/launchql/libpg-query-node/assets/545047/5fd420cc-cdc6-4211-9b0f-0eca8321ba72" alt="webincubator" width="100">
</p>

Generate GraphQL mutations/queries 

## Introspection

```sh
npm install launchql-gen
```

### Usage

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

### output

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

## LaunchQL Client

```sh
npm install launchql-client
```

### Usage

```js
import { Client } from 'launchql-client';

const client = new Client({
    introspection: { ...queries, ...mutations }
});

 const result = client
    .query('Action')
    .edges(true)
    .getMany({
      select: {
        id: true,
        name: true,
        photo: true,
        title: true,
        actionResults: {
          select: {
            id: true,
            actionId: true
          },
          variables: {
            first: 10,
            before: null,
            filter: {
              name: {
                in: ['abc', 'def']
              },
              actionId: { equalTo: 'dc310161-7a42-4b93-6a56-9fa48adcad7e' }
            }
          }
        }
      }
    })
    .print();
```

### output

```gql
query getActionsQuery(
  $first: Int
  $last: Int
  $after: Cursor
  $before: Cursor
  $offset: Int
  $condition: ActionCondition
  $filter: ActionFilter
  $orderBy: [ActionsOrderBy!]
) {
  actions(
    first: $first
    last: $last
    offset: $offset
    after: $after
    before: $before
    condition: $condition
    filter: $filter
    orderBy: $orderBy
  ) {
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      endCursor
      startCursor
    }
    edges {
      cursor
      node {
        id
        name
        photo
        title
        actionResults(
          first: 10
          before: null
          filter: {
            name: { in: ["abc", "def"] }
            actionId: { equalTo: "dc310161-7a42-4b93-6a56-9fa48adcad7e" }
          }
        ) {
          nodes {
            id
            actionId
          }
        }
      }
    }
  }
}
```
