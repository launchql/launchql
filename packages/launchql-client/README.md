# launchql-client

<p align="center" width="100%">
  <img height="120" src="https://github.com/launchql/pgsql-parser/assets/545047/6440fa7d-918b-4a3b-8d1b-755d85de8bea" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql-2.0/blob/main/LICENSE-MIT"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/launchql-client"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql-2.0?filename=packages%2Flaunchql-client%2Fpackage.json"/></a>
</p>

Generate GraphQL mutations/queries

```sh
npm install launchql-client
```

## Usage

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

# output

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
