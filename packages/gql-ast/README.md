# gql-ast

Super bare-bones GraphQL AST utils

<p align="center" width="100%" >
  <img height="250" src="https://github.com/user-attachments/assets/d0456af5-b6e9-422e-a45d-2574d5be490f" />
</p>

<p align="center" width="100%" >
  <a href="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql-2.0/blob/main/LICENSE-MIT"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/gql-ast"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql-2.0?filename=packages%2Fgql-ast%2Fpackage.json"/></a>
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
