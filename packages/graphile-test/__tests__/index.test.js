import '../utils/env';
import { GraphQLTest, env, snapshot } from 'graphile-test';
import { IntrospectionQuery } from '../utils/queries';

const { SCHEMA } = env;

const getDbString = () =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

const { setup, teardown, graphQL } = GraphQLTest(
  {
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

it('works', async () => {
  await graphQL(async query => {
    const data = await query(IntrospectionQuery);
    expect(snapshot(data)).toMatchSnapshot();
  });
});
