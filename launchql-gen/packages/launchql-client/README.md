# launchql-client

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
