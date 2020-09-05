# graphile-gen

Generate JS files for mutations/queries for your Graphile GraphQL projects

## notes

* assumes using simple inflection
* used for scaffolding, NOT for production use

```sh
npm install graphile-gen
```

```js
import {
  updateOne,
  createOne,
  deleteOne,
  getOne,
  getMany,
  getManyOwned
} from 'graphile-gen';
import { print } from 'graphql/language';

const { ast } = createOne(tableDefn);
console.log(print(ast));
```

output:

```
mutation createProductMutation($id: UUID, $ownerId: UUID, $name: String!, $rhinoFoot: String, $hiddenFoot: String, $lizardFeet: String) {
  createProduct(input: {product: {id: $id, ownerId: $ownerId, name: $name, rhinoFoot: $rhinoFoot, hiddenFoot: $hiddenFoot, lizardFeet: $lizardFeet}}) {
    product {
      id
      ownerId
      name
      rhinoFoot
      hiddenFoot
      lizardFeet
    }
  }
}
```

## methods currently supported

```
  crudify
  updateOne
  createOne
  deleteOne
  getOne
  getMany
  getManyOwned
```

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

## methods currently supported

```
  crudify
  updateOne
  createOne
  deleteOne
  getOne
  getMany
  getManyOwned
```
