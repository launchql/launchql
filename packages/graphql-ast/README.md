# graphql-ast

Super bare-bones GraphQL AST utils

```sh
npm install @pyramation/graphql-ast
```

```js
import * as t from '@pyramation/graphql-ast';

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