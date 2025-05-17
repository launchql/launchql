# graphile-test

<p align="center" width="100%">
  <img height="250" src="https://github.com/user-attachments/assets/d0456af5-b6e9-422e-a45d-2574d5be490f" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
  <a href="https://github.com/launchql/launchql-2.0/blob/main/LICENSE-MIT">
    <img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
  </a>
  <a href="https://www.npmjs.com/package/graphile-test">
    <img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql-2.0?filename=packages%2Fgraphile-test%2Fpackage.json"/>
  </a>
</p>

## Install

```sh
npm install graphile-test
```

---

## How to Use

### 1. Create Required Postgres Role

```sql
CREATE ROLE authenticated;
```

---

### 2. Write a Test

```ts
import { GraphQLTest, snapshot } from 'graphile-test';
import { MyGraphQLQuery } from '../src/queries';

const dbname = 'graphile_test_db';
const schemas = ['app_public'];

const { setup, teardown, graphQL } = GraphQLTest({
  dbname,
  schemas,
  authRole: 'postgres',
});

beforeAll(async () => {
  await setup();
});
afterAll(async () => {
  await teardown();
});

it('query', async () => {
  await graphQL(async query => {
    const data = await query(MyGraphQLQuery);
    expect(snapshot(data)).toMatchSnapshot();
  });
});
```

---

## Testing Setup

Before running tests, prepare your database:

```sh
createdb graphile_test_db
psql -f sql/test.sql graphile_test_db
```

---

## Environment Variables

You can override the default Postgres connection settings by setting the following environment variables:

```sh
export PGUSER=your_pg_user
export PGHOST=your_pg_host
export PGPORT=your_pg_port
```

Once set, these will be automatically picked up by `graphile-test` when establishing connections.

---

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
