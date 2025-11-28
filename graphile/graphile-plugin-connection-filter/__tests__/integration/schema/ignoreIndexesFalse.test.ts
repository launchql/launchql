import * as core from '../../../utils/schemaCore';
import { PgConnectionArgCondition } from 'graphile-build-pg';
import ConnectionFilterPlugin from '../../../src/index';

test(
  'prints a schema with the filter plugin and the `ignoreIndexes: false` option',
  core.test(['p'], {
    skipPlugins: [PgConnectionArgCondition],
    appendPlugins: [ConnectionFilterPlugin],
    disableDefaultMutations: true,
    legacyRelations: 'omit',
    ignoreIndexes: false,
    graphileBuildOptions: {
      connectionFilterComputedColumns: false,
      connectionFilterSetofFunctions: false,
    },
  })
);
