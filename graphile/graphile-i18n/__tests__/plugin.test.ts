import '../utils/env';
import { join } from 'path';
import { getGraphileSettings } from 'graphile-settings';
import { getConnections, snapshot } from 'graphile-test';
import { seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';
import type { GraphQLQueryFn } from 'graphile-test';
import { GetProjectsAndLanguages } from '../utils/queries';

const SCHEMA = process.env.SCHEMA ?? 'app_public';
const sql = (f: string) => join(__dirname, '../sql', f);

let teardown: () => Promise<void>;
let query: GraphQLQueryFn;
let db: PgTestClient;

beforeAll(async () => {
  const graphileSettings = getGraphileSettings({
    graphile: {
      schema: [SCHEMA]
    },
    features: {
      postgis: false,
      simpleInflection: true,
      oppositeBaseNames: true
    }
  });

  const connections = await getConnections(
    {
      schemas: [SCHEMA],
      authRole: 'authenticated',
      graphile: {
        appendPlugins: graphileSettings.appendPlugins,
        graphileBuildOptions: {
          ...graphileSettings.graphileBuildOptions,
          langPluginLanguageCodeGqlField: 'langCode',
          langPluginLanguageCodeColumn: 'lang_code',
          langPluginAllowedTypes: ['citext', 'text'],
          langPluginDefaultLanguages: ['en']
        },
        overrideSettings: {
          ...graphileSettings,
          appendPlugins: graphileSettings.appendPlugins,
          graphileBuildOptions: graphileSettings.graphileBuildOptions,
          additionalGraphQLContextFromRequest:
            graphileSettings.additionalGraphQLContextFromRequest
        }
      }
    },
    [
      seed.sqlfile([sql('roles.sql'), sql('test.sql')])
    ]
  );

  ({ db, query, teardown } = connections);
});

beforeEach(() => db.beforeEach());
beforeEach(async () => {
  db.setContext({
    role: 'authenticated'
  });
});
afterEach(() => db.afterEach());
afterAll(async () => {
  await teardown();
});

it('exposes localized strings', async () => {
  const data = await query(GetProjectsAndLanguages, undefined, undefined, {
    headers: {
      'accept-language': 'es'
    }
  });
  expect(snapshot(data)).toMatchSnapshot();
});
