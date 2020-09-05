# graphile-gen

Generate JS files for mutations/queries for your Graphile GraphQL projects

* assumes using simple inflection

```sh
npm install graphile-gen
```

## introspecting via Postgres

```js
import {
  pg as gen
} from 'graphile-gen';
import { print } from 'graphql/language';

const { ast } = gen.createOne(tableDefn);
console.log(print(ast));
```


## introspecting via GraphQL

```js
import {
  gql as gen
} from 'graphile-gen';
import { print } from 'graphql/language';

const { ast } = pgGen.generate(resultOfIntrospectionQuery);
console.log(print(ast));
```

# output

which will output:

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
