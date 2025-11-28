import * as core from "../../../utils/schemaCore";
import PostgisPlugin from "@graphile/postgis";
import ConnectionFilterPlugin from "postgraphile-plugin-connection-filter";

import PostgisConnectionFilterPlugin from "../../../src";

test(
  "prints a schema with the postgraphile-plugin-connection-filter-postgis plugin",
  core.test(["p"], {
    appendPlugins: [
      PostgisPlugin,
      ConnectionFilterPlugin,
      PostgisConnectionFilterPlugin,
    ],
    disableDefaultMutations: true,
    legacyRelations: "omit",
  })
);
