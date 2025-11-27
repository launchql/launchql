import * as core from '../../../utils/schemaCore';
import { PgConnectionArgCondition } from 'graphile-build-pg';
import ConnectionFilterPlugin from '../../../src/index';

test(
  'prints a schema with the filter plugin and the `connectionFilterSetofFunctions: false` option',
  core.test(['p'], {
    skipPlugins: [PgConnectionArgCondition],
    appendPlugins: [ConnectionFilterPlugin],
    disableDefaultMutations: true,
    legacyRelations: 'omit',
    graphileBuildOptions: {
      connectionFilterSetofFunctions: false,
    },
  })
);
