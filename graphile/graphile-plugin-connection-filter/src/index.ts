import { findAndRequirePackageJson } from 'find-and-require-package-json';
import type { Plugin } from 'graphile-build';

import ConnectionArgFilterPlugin from './ConnectionArgFilterPlugin';
import PgConnectionArgFilterBackwardRelationsPlugin from './PgConnectionArgFilterBackwardRelationsPlugin';
import PgConnectionArgFilterColumnsPlugin from './PgConnectionArgFilterColumnsPlugin';
import PgConnectionArgFilterComputedColumnsPlugin from './PgConnectionArgFilterComputedColumnsPlugin';
import PgConnectionArgFilterCompositeTypeColumnsPlugin from './PgConnectionArgFilterCompositeTypeColumnsPlugin';
import PgConnectionArgFilterForwardRelationsPlugin from './PgConnectionArgFilterForwardRelationsPlugin';
import PgConnectionArgFilterLogicalOperatorsPlugin from './PgConnectionArgFilterLogicalOperatorsPlugin';
import PgConnectionArgFilterOperatorsPlugin from './PgConnectionArgFilterOperatorsPlugin';
import PgConnectionArgFilterPlugin from './PgConnectionArgFilterPlugin';
import PgConnectionArgFilterRecordFunctionsPlugin from './PgConnectionArgFilterRecordFunctionsPlugin';
import type { ConnectionFilterConfig, ConnectionFilterOptions } from './types';

const pkg = findAndRequirePackageJson(__dirname);

const defaultOptions: ConnectionFilterConfig = {
  connectionFilterArrays: true,
  connectionFilterComputedColumns: true,
  connectionFilterRelations: false,
  connectionFilterSetofFunctions: true,
  connectionFilterLogicalOperators: true,
  connectionFilterAllowNullInput: false,
  connectionFilterAllowEmptyObjectInput: false,
};

const PostGraphileConnectionFilterPlugin: Plugin = (
  builder,
  configOptions: ConnectionFilterOptions = {}
) => {
  builder.hook('build', (build) => {
    if (!build.versions) {
      throw new Error(
        `Plugin ${pkg.name}@${pkg.version} requires graphile-build@^4.1.0 in order to check dependencies (current version: ${build.graphileBuildVersion})`
      );
    }
    const depends = (name: string, range: string) => {
      if (!build.hasVersion(name, range)) {
        throw new Error(
          `Plugin ${pkg.name}@${pkg.version} requires ${name}@${range} (${
            build.versions[name]
              ? `current version: ${build.versions[name]}`
              : 'not found'
          })`
        );
      }
    };
    depends('graphile-build-pg', '^4.5.0');

    build.versions = build.extend(build.versions, { [pkg.name]: pkg.version });

    return build;
  });

  const options: ConnectionFilterConfig = {
    ...defaultOptions,
    ...configOptions,
  };
  const { connectionFilterRelations, connectionFilterLogicalOperators } =
    options;

  ConnectionArgFilterPlugin(builder, options);
  PgConnectionArgFilterPlugin(builder, options);
  PgConnectionArgFilterColumnsPlugin(builder, options);
  PgConnectionArgFilterComputedColumnsPlugin(builder, options);
  PgConnectionArgFilterCompositeTypeColumnsPlugin(builder, options);
  PgConnectionArgFilterRecordFunctionsPlugin(builder, options);

  if (connectionFilterRelations) {
    PgConnectionArgFilterBackwardRelationsPlugin(builder, options);
    PgConnectionArgFilterForwardRelationsPlugin(builder, options);
  }

  if (connectionFilterLogicalOperators) {
    PgConnectionArgFilterLogicalOperatorsPlugin(builder, options);
  }

  PgConnectionArgFilterOperatorsPlugin(builder, options);
};

export type { ConnectionFilterConfig, ConnectionFilterOptions };
export { PostGraphileConnectionFilterPlugin };
export default PostGraphileConnectionFilterPlugin;
