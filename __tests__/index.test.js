import '../utils/env';
import { GraphQLTest, env, snapshot } from 'graphile-test';
import {
  GetMetaSchema,
  GetMetaSchemaUnion,
  GetMetaInflection,
  GetMetaRelations
} from '../utils/queries';
import { PgMetaschemaPlugin } from '../src';
import PgManyToMany from '@graphile-contrib/pg-many-to-many';

const { SCHEMA } = env;

const getDbString = () =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

const { setup, teardown, graphQL } = GraphQLTest(
  {
    appendPlugins: [PgManyToMany, PgMetaschemaPlugin],
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

it('GetMetaSchema', async () => {
  await graphQL(async query => {
    const data = await query(GetMetaSchema);
    expect(snapshot(data)).toMatchSnapshot();
  });
});
it('GetMetaSchemaUnion', async () => {
  await graphQL(async query => {
    const data = await query(GetMetaSchemaUnion);
    expect(snapshot(data)).toMatchSnapshot();
  });
});
it('GetMetaInflection', async () => {
  await graphQL(async query => {
    const data = await query(GetMetaInflection);
    expect(snapshot(data)).toMatchSnapshot();
  });
});
it('GetMetaRelations', async () => {
  await graphQL(async query => {
    const data = await query(GetMetaRelations);
    expect(snapshot(data)).toMatchSnapshot();
  });
});
