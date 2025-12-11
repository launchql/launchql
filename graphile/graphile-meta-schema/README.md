# graphile-meta-schema

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
  <a href="https://www.npmjs.com/package/graphile-meta-schema">
    <img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=graphile%2Fgraphile-meta-schema%2Fpackage.json"/>
  </a>
</p>

**`graphile-meta-schema`** exposes a `_meta` GraphQL schema so you can introspect tables, fields, and constraints directly from PostGraphile.

## 🚀 Installation

```sh
pnpm add graphile-meta-schema
```

## ✨ Features

- GraphQL meta endpoint for table/field/constraint details
- Works alongside your existing PostGraphile schemas
- Ships with fixtures to explore constraint metadata

## 📦 Usage

Register the plugin with PostGraphile (CLI or library):

```ts
import express from 'express';
import { postgraphile } from 'postgraphile';
import PgMetaschemaPlugin from 'graphile-meta-schema';

const app = express();

app.use(
  postgraphile(process.env.DATABASE_URL, ['app_public'], {
    appendPlugins: [PgMetaschemaPlugin]
  })
);
```

The plugin adds a `_meta` query root alongside your existing schemas. Use it to inspect fields, constraints, relations, and generated inflection.

### Example Query

```gql
query MetaQuery {
  _meta {
    tables {
      name
      fields {
        name
        type {
          name
        }
      }
      constraints {
        ... on MetaschemaForeignKeyConstraint {
          fields {
            name
          }
          refTable {
            name
            fields {
              name
            }
          }
          refFields {
            name
          }
        }

        ... on MetaschemaPrimaryKeyConstraint {
          __typename
          fields {
            name
            type {
              name
            }
          }
          name
        }

        ... on MetaschemaUniqueConstraint {
          __typename
          name
          fields {
            name
            type {
              name
            }
          }
        }
        ... on MetaschemaCheckConstraint {
          __typename
          name
          fields {
            name
            type {
              name
            }
          }
        }
      }
    }
  }
}
```

## 🧪 Testing

```sh
# requires a local Postgres with PostGIS available (defaults to postgres/password@localhost:5432)
pnpm --filter graphile-meta-schema test
```