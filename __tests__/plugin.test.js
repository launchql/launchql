import '../utils/env';
import { env, snapshot } from 'graphile-test';
import { GraphQLTest } from '../utils/graphile-test';
import { GetProjectsAndLanguages } from '../utils/queries';
import { LangPlugin, makeLanguageDataLoaderForTable } from '../src';

const { SCHEMA } = env;

const getDbString = () =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

const { setup, teardown, graphQL } = GraphQLTest(
  {
    appendPlugins: [LangPlugin],
    schema: SCHEMA,
    graphqlRoute: '/graphql',
    graphileBuildOptions: {
      langPluginLanguageCodeGqlField: 'langCode',
      langPluginLanguageCodeColumn: 'lang_code',
      langPluginAllowedTypes: ['citext', 'text'],
      langPluginDefaultLanguages: ['en']
    }
  },
  {
    langCodes: ['es'],
    getLanguageDataLoader: makeLanguageDataLoaderForTable()
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
  await graphQL(async (query) => {
    const data = await query(GetProjectsAndLanguages);
    expect(snapshot(data)).toMatchSnapshot();
  });
});
