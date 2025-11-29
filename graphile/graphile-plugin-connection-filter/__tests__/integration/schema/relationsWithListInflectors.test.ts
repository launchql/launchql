import { PgConnectionArgCondition } from 'graphile-build-pg';
import { setupSchemaTest } from '../../../test-utils/schemaCore';
import ConnectionFilterPlugin from '../../../src/index';
import PgSimplify from '@graphile-contrib/pg-simplify-inflector';

const runSchemaTest = setupSchemaTest(['p'], {
  skipPlugins: [PgConnectionArgCondition],
  appendPlugins: [ConnectionFilterPlugin, PgSimplify],
  disableDefaultMutations: true,
  legacyRelations: 'omit',
  simpleCollections: 'both',
  graphileBuildOptions: {
    connectionFilterRelations: true,
    pgOmitListSuffix: true,
    connectionFilterUseListInflectors: true,
  },
});

test(
  'prints a schema with the filter plugin, the simplify plugin, and both `connectionFilterRelations` and `connectionFilterUseListInflectors` set to `true`',
  runSchemaTest
);
