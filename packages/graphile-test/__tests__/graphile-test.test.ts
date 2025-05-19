process.env.LOG_SCOPE='graphile-test';

// process.env FIRST!

import { GraphQLTest, snapshot } from '../src';
import { IntrospectionQuery } from '../test-utils/queries';


const dbname = 'graphile_test_db';
const schemas = ['app_public']

const { setup, teardown, graphQL } = GraphQLTest(
  {
    schemas,
    dbname,
    authRole: 'postgres'
  }
);

beforeAll(async () => {
  await setup();
});
afterAll(async () => {
  await teardown();
});

it('works', async () => {
  await graphQL(async (query: any) => {
    const data = await query(IntrospectionQuery);
    expect(snapshot(data)).toMatchSnapshot();
  });
});
