import '../utils/env';
import { GraphQLTest, env, snapshot } from 'graphile-test';
import { GetMetaSchema, GetMetaSchemaUnion } from '../utils/queries';
import { PgMetaschemaPlugin } from '../src';

const { SCHEMA } = env;

const getDbString = () =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

const { setup, teardown, graphQL } = GraphQLTest(
  {
    appendPlugins: [PgMetaschemaPlugin],
    dynamicJson: true,
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

it('individual', async () => {
  await graphQL(async query => {
    const data = await query(GetMetaSchema);
    expect(snapshot(data)).toMatchSnapshot();
  });
});
it('union', async () => {
  await graphQL(async query => {
    const data = await query(GetMetaSchemaUnion);
    expect(snapshot(data)).toMatchSnapshot();
  });
});
