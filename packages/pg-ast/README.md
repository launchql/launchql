# pg-ast

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/pg-ast"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=packages%2Fpg-ast%2Fpackage.json"/></a>
</p>

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

## Pairs well with `pgsql-deparser`

https://github.com/constructive-iopgsql-parser

You can create ASTs manually, and then generate your SQL:

```js
import * as ast from '../src';
import { deparse } from 'pgsql-deparser';

const node = ast.A_Expr({
  kind: 0,
  name: [ast.String({ str: '=' })],
  lexpr: ast.Integer({ ival: 0 }),
  rexpr: ast.Integer({ ival: 0 })
});
const sqlCode = deparse([node]);
```
