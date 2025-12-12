# graphile-many-to-many

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
  <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE">
    <img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
  </a>
  <a href="https://www.npmjs.com/package/graphile-many-to-many">
    <img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=graphile%2Fgraphile-many-to-many%2Fpackage.json"/>
  </a>
</p>

**`graphile-many-to-many`** adds connection fields for many-to-many relations in PostGraphile v4 / Graphile Engine schemas so join tables automatically expose relay-friendly collections. Requires `postgraphile@^4.5.0` or `graphile-build-pg@^4.5.0`.

## 🚀 Installation

```bash
pnpm add graphile-many-to-many
```

## ✨ Features

- Generates many-to-many connection and simple collection fields from junction tables
- Works with PostGraphile CLI and library usage
- Smart comments (`@omit manyToMany`) to suppress specific relations
- Configurable field names via inflectors or smart comments

## 📦 Usage

Append the plugin and the fields will be added to your schema.

### PostGraphile CLI

```bash
pnpm add postgraphile graphile-many-to-many
npx postgraphile --append-plugins graphile-many-to-many
```

### Library

```js
const express = require("express");
const { postgraphile } = require("postgraphile");
const PgManyToManyPlugin = require("graphile-many-to-many");

const app = express();

app.use(
  postgraphile(process.env.DATABASE_URL, "app_public", {
    appendPlugins: [PgManyToManyPlugin],
    graphiql: true,
  })
);

app.listen(5000);
```

Example query:

```graphql
{
  allPeople {
    nodes {
      personName
      teamsByTeamMemberPersonIdAndTeamId {
        nodes {
          teamName
        }
      }
    }
  }
}
```

## 🙅‍♀️ Excluding Fields

Use `@omit manyToMany` [smart comments](https://www.graphile.org/postgraphile/smart-comments/) on constraints or tables to prevent fields from being generated.

```sql
-- omit a relation by constraint
comment on constraint qux_bar_id_fkey on p.qux is E'@omit manyToMany';

-- or omit the junction table entirely
comment on table p.corge is E'@omit manyToMany';
```

## 📝 Field Naming

Field names are verbose by default (e.g. `teamsByTeamMemberTeamId`) to avoid collisions. You can override them with an inflector plugin or smart comments.

### Custom inflector

> Warning: Short names can collide when a junction table references the same target multiple times—customize accordingly.

```js
const { makeAddInflectorsPlugin } = require("graphile-utils");

module.exports = makeAddInflectorsPlugin(
  {
    manyToManyRelationByKeys(
      _leftKeyAttributes,
      _junctionLeftKeyAttributes,
      _junctionRightKeyAttributes,
      _rightKeyAttributes,
      _junctionTable,
      rightTable,
      _junctionLeftConstraint,
      junctionRightConstraint
    ) {
      if (junctionRightConstraint.tags.manyToManyFieldName) {
        return junctionRightConstraint.tags.manyToManyFieldName;
      }
      return this.camelCase(
        `${this.pluralize(this._singularizedTableName(rightTable))}`
      );
    },
    manyToManyRelationByKeysSimple(
      _leftKeyAttributes,
      _junctionLeftKeyAttributes,
      _junctionRightKeyAttributes,
      _rightKeyAttributes,
      _junctionTable,
      rightTable,
      _junctionLeftConstraint,
      junctionRightConstraint
    ) {
      if (junctionRightConstraint.tags.manyToManySimpleFieldName) {
        return junctionRightConstraint.tags.manyToManySimpleFieldName;
      }
      return this.camelCase(
        `${this.pluralize(this._singularizedTableName(rightTable))}-list`
      );
    },
  },
  true // Passing true here allows the plugin to overwrite existing inflectors.
);
```

### Smart comments

```sql
-- rename the Connection field
comment on constraint membership_team_id_fkey on p.membership is E'@manyToManyFieldName teams';

-- rename both Connection and simple collection fields (when simple collections are enabled)
comment on constraint membership_team_id_fkey on p.membership is E'@manyToManyFieldName teams\n@manyToManySimpleFieldName teamsList';
```

## 🧪 Testing

```sh
# requires a local Postgres available (defaults to postgres/password@localhost:5432)
pnpm --filter graphile-many-to-many test
```
