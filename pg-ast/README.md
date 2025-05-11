# pg-ast ![Build Status](https://travis-ci.org/pyramation/pg-ast.svg?branch=master)

Create PostgreSQL ASTs with JavaScript

## Installation

```sh
npm install pg-ast
```

## Usage 

```js
import * as ast from 'pg-ast';
const node = ast.A_Expr({
    kind: 0,
    name: [ast.String({ str: '=' })],
    lexpr: ast.Integer({ ival: 0 }),
    rexpr: ast.Integer({ ival: 0 })
});
```

## Pairs well with `pgsql-parser`

https://github.com/pyramation/pgsql-parser

You can create ASTs manually, and then generate your SQL:

```js
import * as ast from '../src';
import { deparse } from 'pgsql-parser';

const node = ast.A_Expr({
  kind: 0,
  name: [ast.String({ str: '=' })],
  lexpr: ast.Integer({ ival: 0 }),
  rexpr: ast.Integer({ ival: 0 })
});
const sqlCode = deparse([node]);
```