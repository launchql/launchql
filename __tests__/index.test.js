import '../utils/env';
import { GraphQLTest, env, snapshot } from 'graphile-test';
import {
  GetMetaSchema,
  GetMetaSchemaUnion,
  GetMetaInflection,
  GetBelongsToRelations,
  GetHasOneRelations,
  GetHasManyRelations,
  GetManyToManyRelations
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
    expect(data.errors).toBe(undefined);
    expect(snapshot(data)).toMatchSnapshot();
  });
});
it('GetMetaSchemaUnion', async () => {
  await graphQL(async query => {
    const data = await query(GetMetaSchemaUnion);
    expect(data.errors).toBe(undefined);
    expect(snapshot(data)).toMatchSnapshot();
  });
});
it('GetMetaInflection', async () => {
  await graphQL(async query => {
    const data = await query(GetMetaInflection);
    expect(data.errors).toBe(undefined);
    expect(snapshot(data)).toMatchSnapshot();
  });
});
it('GetHasOneRelations', async () => {
  await graphQL(async query => {
    const data = await query(GetHasOneRelations);
    expect(data.errors).toBe(undefined);
    expect(snapshot(data)).toMatchSnapshot();
  });
});
it('GetHasManyRelations', async () => {
  await graphQL(async query => {
    const data = await query(GetHasManyRelations);
    expect(data.errors).toBe(undefined);
    expect(snapshot(data)).toMatchSnapshot();
  });
});
it('GetBelongsToRelations', async () => {
  await graphQL(async query => {
    const data = await query(GetBelongsToRelations);
    expect(data.errors).toBe(undefined);
    expect(snapshot(data)).toMatchSnapshot();
  });
});
it('GetManyToManyRelations', async () => {
  await graphQL(async query => {
    const data = await query(GetManyToManyRelations);
    expect(data.errors).toBe(undefined);
    expect(snapshot(data)).toMatchSnapshot();
  });
});
