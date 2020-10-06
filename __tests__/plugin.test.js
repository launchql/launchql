import '../utils/env';
import { GraphQLTest, env, snapshot } from 'graphile-test';
import {
  GoalsSearchViaCondition,
  GoalsSearchViaFilter,
  GoalsSearchViaCondition2,
  GoalsSearchViaFilter2
} from '../utils/queries';
import { PgSearchPlugin } from '../src';
import PgSimpleInflector from 'graphile-simple-inflector';
import ConnectionFilterPlugin from 'postgraphile-plugin-connection-filter';
import FulltextFilterPlugin from '@pyramation/postgraphile-plugin-fulltext-filter';

const { SCHEMA } = env;

const getDbString = () =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

const { setup, teardown, graphQL } = GraphQLTest(
  {
    appendPlugins: [
      PgSimpleInflector,
      ConnectionFilterPlugin,
      FulltextFilterPlugin,
      PgSearchPlugin
    ],
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

it('GoalsSearchViaFilter (order not relevant)', async () => {
  await graphQL(async (query) => {
    const data = await query(GoalsSearchViaFilter, {
      search: 'fowl'
    });
    expect(snapshot(data)).toMatchSnapshot();
  });
});

it('GoalsSearchViaCondition (order is relevant)', async () => {
  await graphQL(async (query) => {
    const data = await query(GoalsSearchViaCondition, {
      search: 'fowl'
    });
    expect(snapshot(data)).toMatchSnapshot();
  });
});

it('GoalsSearchViaFilter (order not relevant)', async () => {
  await graphQL(async (query) => {
    const data = await query(GoalsSearchViaFilter2, {
      search: 'fowl'
    });
    expect(snapshot(data)).toMatchSnapshot();
  });
});

it('GoalsSearchViaCondition (order is relevant)', async () => {
  await graphQL(async (query) => {
    const data = await query(GoalsSearchViaCondition2, {
      search: 'fowl'
    });
    expect(snapshot(data)).toMatchSnapshot();
  });
});
