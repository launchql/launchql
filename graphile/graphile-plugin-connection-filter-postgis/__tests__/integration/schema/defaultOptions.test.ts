import { setupSchemaTest } from '../../../test-utils/schemaCore';
import PostgisPlugin from '@graphile/postgis';
import ConnectionFilterPlugin from 'graphile-plugin-connection-filter';

import PostgisConnectionFilterPlugin from '../../../src';

const runSchemaTest = setupSchemaTest(['p'], {
  appendPlugins: [
    PostgisPlugin,
    ConnectionFilterPlugin,
    PostgisConnectionFilterPlugin,
  ],
  disableDefaultMutations: true,
  legacyRelations: 'omit',
});

test(
  'prints a schema with the graphile-plugin-connection-filter-postgis plugin',
  runSchemaTest
);
