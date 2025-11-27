const core = require("./core");
const PgConnectionFilterPlugin = require("postgraphile-plugin-connection-filter");
const PostgisPlugin = require("@graphile/postgis").default;

test(
  "prints a schema with the postgraphile-plugin-connection-filter-postgis plugin",
  core.test(["p"], {
    appendPlugins: [
      PostgisPlugin,
      PgConnectionFilterPlugin,
      require("../../../index.js"),
    ],
  })
);
