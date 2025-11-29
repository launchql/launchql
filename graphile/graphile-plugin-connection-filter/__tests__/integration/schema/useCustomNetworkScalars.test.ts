import { PgConnectionArgCondition } from 'graphile-build-pg';
import { setupSchemaTest } from '../../../test-utils/schemaCore';
import ConnectionFilterPlugin from '../../../src/index';

const runSchemaTest = setupSchemaTest(['p'], {
  skipPlugins: [PgConnectionArgCondition],
  appendPlugins: [ConnectionFilterPlugin],
  disableDefaultMutations: true,
  legacyRelations: 'omit',
  graphileBuildOptions: {
    pgUseCustomNetworkScalars: true,
  },
});

test(
  'prints a schema with the filter plugin and the `pgUseCustomNetworkScalars: true` option',
  runSchemaTest
);
