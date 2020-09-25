# graphile-gen-sql

Generate mutations/queries for your PostGraphile projects

* assumes using simple inflection

```sh
npm install graphile-gen-sql
```

## introspecting via Postgres

```js
import {
  pg as gen
} from 'graphile-gen-sql';
import { print } from 'graphql/language';

const { ast } = gen.createOne(tableDefn);
console.log(print(ast));
```


## introspecting via GraphQL

```js
import {
  gql as gen
} from 'graphile-gen-sql';
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
