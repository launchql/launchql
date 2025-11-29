import { PgConnectionArgCondition } from 'graphile-build-pg';
import { setupSchemaTest } from '../../../test-utils/schemaCore';
import ConnectionFilterPlugin from '../../../src/index';

const runSchemaTest = setupSchemaTest(['p'], {
  skipPlugins: [PgConnectionArgCondition],
  appendPlugins: [ConnectionFilterPlugin],
  disableDefaultMutations: true,
  legacyRelations: 'omit',
  graphileBuildOptions: {
    connectionFilterOperatorNames: {
      equalTo: 'eq',
      notEqualTo: 'ne',
    },
  },
});

test(
  'prints a schema with the filter plugin and the connectionFilterOperatorNames option',
  runSchemaTest
);
