# `@launchql/query`

<p align="center" width="100%">
  <img height="250" src="https://github.com/user-attachments/assets/d0456af5-b6e9-422e-a45d-2574d5be490f" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@launchql/query"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=packages%query%2Fpackage.json"/></a>
</p>

> Fluent GraphQL query and mutation builder for PostGraphile-based schemas.

## Installation

```sh
npm install @launchql/query
```

## Why Use `@launchql/query`?

* ⚡ Build complex, nested GraphQL queries fluently
* ✅ Schema-aware via introspection (PostGraphile optimized)
* 🧠 Prevents common query syntax issues
* 🧩 Designed for composability and clean syntax

## Usage

```ts
import { QueryBuilder } from '@launchql/query';

const builder = new QueryBuilder({
  introspection: { ...queries, ...mutations } // provide your GraphQL schema metadata
});

const result = builder
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
            actionId: {
              equalTo: 'dc310161-7a42-4b93-6a56-9fa48adcad7e'
            }
          }
        }
      }
    }
  })
  .print();
```

## Output

```graphql
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