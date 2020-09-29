# graphile-test [![Build Status](https://travis-ci.org/pyramation/graphile-test.svg?branch=master)](https://travis-ci.org/pyramation/graphile-test)

```sh
npm install graphile-test 
```

## how to use

make sure env vars are set:

```
PGUSER
PGPASSWORD
PGHOST
PGPORT
PGDATABASE
SCHEMA
```

Then in a test:

```js
import { GraphQLTest, env, snapshot } from 'graphile-test';
import { MyGraphQuery } from '../utils/queries';

const { SCHEMA } = env;

const getDbString = () =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

const { setup, teardown, graphQL } = GraphQLTest(
  {
    appendPlugins: [],
    schema: SCHEMA,
    graphqlRoute: '/graphql'
  },
  getDbString()
);

beforeAll(async () => {
  await setup();
});
afterAll(async () => {
  await teardown();
});

it('it works!', async () => {
  await graphQL(async query => {
    const data = await query(MyGraphQuery);
    expect(snapshot(data)).toMatchSnapshot();
  });
});

```

## testing

```sh
createdb test_database
psql test_database < sql/test.sql
```