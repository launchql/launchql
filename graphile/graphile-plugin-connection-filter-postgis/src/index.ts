import { findAndRequirePackageJson } from 'find-and-require-package-json';
import type { Plugin } from "graphile-build";

import PostgisOperatorsPlugin from "./PgConnectionArgFilterPostgisOperatorsPlugin";

const pkg = findAndRequirePackageJson(__dirname);

const PostGraphileConnectionFilterPostgisPlugin: Plugin = (
  builder,
  options
) => {
  builder.hook("build", (build) => {
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
              : "not found"
          })`
        );
      }
    };

    depends("graphile-build-pg", "^4.5.0");
    depends("graphile-plugin-connection-filter", "^2.0.0");

    build.versions = build.extend(build.versions, { [pkg.name]: pkg.version });

    return build;
  });

  PostgisOperatorsPlugin(builder, options);
};

export { PostGraphileConnectionFilterPostgisPlugin };
export default PostGraphileConnectionFilterPostgisPlugin;
