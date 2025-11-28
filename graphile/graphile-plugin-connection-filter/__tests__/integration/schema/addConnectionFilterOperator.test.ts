import * as core from '../../../test-utils/schemaCore';
import { PgConnectionArgCondition } from 'graphile-build-pg';
import CustomOperatorsPlugin from '../../../test-utils/customOperatorsPlugin';
import ConnectionFilterPlugin from '../../../src/index';

test(
  'prints a schema with the filter plugin and a custom operators plugin using addConnectionFilterOperator',
  core.test(['p'], {
    skipPlugins: [PgConnectionArgCondition],
    appendPlugins: [ConnectionFilterPlugin, CustomOperatorsPlugin],
    disableDefaultMutations: true,
    legacyRelations: 'omit',
  })
);
