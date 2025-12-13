import { findAndRequirePackageJson } from 'find-and-require-package-json';
import type { Plugin } from 'graphile-build';

import PgManyToManyRelationEdgeColumnsPlugin from './PgManyToManyRelationEdgeColumnsPlugin';
import PgManyToManyRelationEdgeTablePlugin from './PgManyToManyRelationEdgeTablePlugin';
import PgManyToManyRelationInflectionPlugin from './PgManyToManyRelationInflectionPlugin';
import PgManyToManyRelationPlugin from './PgManyToManyRelationPlugin';
import type { PgManyToManyOptions } from './types';

const pkg = findAndRequirePackageJson(__dirname);

const PgManyToManyPlugin: Plugin = (builder: any, options: PgManyToManyOptions = {}) => {
  builder.hook('build', (build: any) => {
    // Check dependencies
    if (!build.versions) {
      throw new Error(
        `Plugin ${pkg.name}@${pkg.version} requires graphile-build@^4.1.0 in order to check dependencies (current version: ${build.graphileBuildVersion})`
      );
    }
    const depends = (name: string, range: string) => {
      if (!build.hasVersion(name, range)) {
        throw new Error(
          `Plugin ${pkg.name}@${pkg.version} requires ${name}@${range} (${
            build.versions[name] ? `current version: ${build.versions[name]}` : 'not found'
          })`
        );
      }
    };
    depends('graphile-build-pg', '^4.5.0');

    // Register this plugin
    build.versions = build.extend(build.versions, { [pkg.name]: pkg.version });

    return build;
  });

  PgManyToManyRelationInflectionPlugin(builder, options);
  PgManyToManyRelationPlugin(builder, options);
  PgManyToManyRelationEdgeColumnsPlugin(builder, options);
  PgManyToManyRelationEdgeTablePlugin(builder, options);
};

export { PgManyToManyPlugin };
export type { PgManyToManyOptions };
export default PgManyToManyPlugin;
