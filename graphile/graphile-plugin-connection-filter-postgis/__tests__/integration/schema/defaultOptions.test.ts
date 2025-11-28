import * as core from "../../../test-utils/schemaCore";
import PostgisPlugin from "@graphile/postgis";
import ConnectionFilterPlugin from "graphile-plugin-connection-filter";

import PostgisConnectionFilterPlugin from "../../../src";

test(
  "prints a schema with the graphile-plugin-connection-filter-postgis plugin",
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
