# gql-ast

Super bare-bones GraphQL AST utils

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/gql-ast"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=packages%2Fgql-ast%2Fpackage.json"/></a>
</p>

```sh
npm install gql-ast
```

```js
import * as t from 'gql-ast';

const ast = t.document({
  definitions: [
    t.operationDefinition({
      operation: 'mutation',
      name: mutationName,
      variableDefinitions,
      selectionSet: t.selectionSet({ selections: ... })
    })
  ]
});
```
