# graphile-gen-js

Generate JS files for mutations/queries for your Graphile GraphQL projects

```sh
npm install graphile-gen-js
```

```js
import { crudify } from 'graphile-gen-js';

crudify(introspection);
```

will produce

```js
  export const updateProductMutation = gql`
    mutation updateProductMutation($id: UUID!, $ownerId: UUID, $name: String, $rhinoFoot: String, $hiddenFoot: String, $lizardFeet: String) {
      updateProduct(input: {id: $id, patch: {ownerId: $ownerId, name: $name, rhinoFoot: $rhinoFoot, hiddenFoot: $hiddenFoot, lizardFeet: $lizardFeet}}) {
        product {
          id
          ownerId
          name
          rhinoFoot
          hiddenFoot
          lizardFeet
        }
      }
    }`;
```