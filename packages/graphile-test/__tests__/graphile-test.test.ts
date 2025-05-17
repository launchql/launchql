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
    // @ts-ignore
  await graphQL(async query => {
    const data = await query(IntrospectionQuery);
    expect(snapshot(data)).toMatchSnapshot();
  });
});
