# graphile-gen

Generate JS files for mutations/queries for your Graphile projects

* assumes using simple inflection


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

# methods

currently supported

```
  updateOne
  createOne
  deleteOne
  getOne
  getMany
  getManyOwned
```