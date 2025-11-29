import { PgConnectionArgCondition } from 'graphile-build-pg';
import CustomOperatorsPlugin from '../../../test-utils/customOperatorsPlugin';
import { setupSchemaTest } from '../../../test-utils/schemaCore';
import ConnectionFilterPlugin from '../../../src/index';

const runSchemaTest = setupSchemaTest(['p'], {
  skipPlugins: [PgConnectionArgCondition],
  appendPlugins: [ConnectionFilterPlugin, CustomOperatorsPlugin],
  disableDefaultMutations: true,
  legacyRelations: 'omit',
});

test(
  'prints a schema with the filter plugin and a custom operators plugin using addConnectionFilterOperator',
  runSchemaTest
);
