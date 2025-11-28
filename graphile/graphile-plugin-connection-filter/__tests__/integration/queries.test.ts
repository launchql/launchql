import '../../test-utils/env';

import { readdirSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type { Plugin } from 'graphile-build';
import { PgConnectionArgCondition } from 'graphile-build-pg';
import type { GraphQLQueryFnObj } from 'graphile-test';
import { getConnectionsObject, seed, snapshot } from 'graphile-test';
import type { PgTestClient } from 'pgsql-test/test-client';
import type { PostGraphileOptions } from 'postgraphile';

import ConnectionFilterPlugin from '../../src';
import CustomOperatorsPlugin from '../../test-utils/customOperatorsPlugin';

jest.setTimeout(60000);

type ConnectionVariant =
  | 'addConnectionFilterOperator'
  | 'dynamicJson'
  | 'networkScalars'
  | 'normal'
  | 'nullAndEmptyAllowed'
  | 'relations'
  | 'simpleCollections';

type ConnectionContext = {
  db: PgTestClient;
  query: GraphQLQueryFnObj;
  teardown: () => Promise<void>;
};

const SCHEMA = process.env.SCHEMA ?? 'p';
const sql = (file: string) => join(__dirname, '../../sql', file);
const queriesDir = join(__dirname, '../fixtures/queries');
const queryFileNames = readdirSync(queriesDir);

const baseOverrides: Pick<
  PostGraphileOptions,
  'appendPlugins' | 'skipPlugins'
> = {
  appendPlugins: [ConnectionFilterPlugin],
  skipPlugins: [PgConnectionArgCondition],
};

const seeds = [
  seed.sqlfile([sql('roles.sql'), sql('schema.sql'), sql('data.sql')]),
];

const createContext = async (
  overrideSettings: Partial<PostGraphileOptions> = {},
  graphileBuildOptions?: Record<string, unknown>
): Promise<ConnectionContext> => {
  const { appendPlugins = [], ...rest } = overrideSettings;
  const appendPluginsMerged = [
    ...baseOverrides.appendPlugins,
    ...appendPlugins.filter(
      (plugin: Plugin) => plugin !== ConnectionFilterPlugin
    ),
  ] as Plugin[];

  const connections = await getConnectionsObject(
    {
      schemas: [SCHEMA],
      authRole: 'authenticated',
      graphile: {
        overrideSettings: {
          ...baseOverrides,
          ...rest,
          appendPlugins: appendPluginsMerged,
        },
        ...(graphileBuildOptions ? { graphileBuildOptions } : {}),
      },
    },
    seeds
  );

  return {
    db: connections.db,
    query: connections.query,
    teardown: connections.teardown,
  };
};

const variantConfigs: Record<
  ConnectionVariant,
  {
    overrideSettings?: Partial<PostGraphileOptions>;
    graphileBuildOptions?: Record<string, unknown>;
  }
> = {
  normal: {},
  dynamicJson: {
    overrideSettings: { dynamicJson: true },
  },
  networkScalars: {
    graphileBuildOptions: {
      pgUseCustomNetworkScalars: true,
    },
  },
  relations: {
    graphileBuildOptions: {
      connectionFilterRelations: true,
    },
  },
  simpleCollections: {
    overrideSettings: { simpleCollections: 'only' },
  },
  nullAndEmptyAllowed: {
    graphileBuildOptions: {
      connectionFilterAllowNullInput: true,
      connectionFilterAllowEmptyObjectInput: true,
    },
  },
  addConnectionFilterOperator: {
    overrideSettings: { appendPlugins: [CustomOperatorsPlugin] },
  },
};

const variantByQueryFile: Record<string, ConnectionVariant> = {
  'addConnectionFilterOperator.graphql': 'addConnectionFilterOperator',
  'dynamicJsonTrue.graphql': 'dynamicJson',
  'types.cidr.graphql': 'networkScalars',
  'types.macaddr.graphql': 'networkScalars',
  'arrayTypes.cidrArray.graphql': 'networkScalars',
  'arrayTypes.macaddrArray.graphql': 'networkScalars',
  'relations.graphql': 'relations',
  'simpleCollections.graphql': 'simpleCollections',
  'nullAndEmptyAllowed.graphql': 'nullAndEmptyAllowed',
};

const contexts: Partial<Record<ConnectionVariant, ConnectionContext>> = {};

beforeAll(async () => {
  for (const variant of Object.keys(variantConfigs) as ConnectionVariant[]) {
    const config = variantConfigs[variant];
    contexts[variant] = await createContext(
      config.overrideSettings,
      config.graphileBuildOptions
    );
  }
});

afterAll(async () => {
  await Promise.all(
    Object.values(contexts).map(async (ctx) => {
      if (ctx) {
        await ctx.teardown();
      }
    })
  );
});

for (const queryFileName of queryFileNames) {
  // eslint-disable-next-line jest/valid-title
  test(queryFileName, async () => {
    const variant = variantByQueryFile[queryFileName] ?? 'normal';
    const ctx = contexts[variant];

    if (!ctx) {
      throw new Error(`Missing connection context for variant ${variant}`);
    }

    await ctx.db.beforeEach();
    ctx.db.setContext({ role: 'authenticated' });

    try {
      const query = await readFile(join(queriesDir, queryFileName), 'utf8');
      const result = await ctx.query({ query });
      expect(snapshot(result)).toMatchSnapshot();
    } finally {
      await ctx.db.afterEach();
    }
  });
}
