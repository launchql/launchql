import * as core from '../../../utils/schemaCore';
import { PgConnectionArgCondition } from 'graphile-build-pg';
import ConnectionFilterPlugin from '../../../src/index';

test(
  'prints a schema with the filter plugin and the connectionFilterOperatorNames option',
  core.test(['p'], {
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
  })
);
