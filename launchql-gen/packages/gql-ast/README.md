# gql-ast

Super bare-bones GraphQL AST utils

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