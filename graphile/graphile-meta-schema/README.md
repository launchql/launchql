# graphile-meta-schema

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/graphile-meta-schema"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=graphile%2Fgraphile-meta-schema%2Fpackage.json"/></a>
</p>

## Install

```sh
pnpm add graphile-meta-schema
```

## Example Query

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

## Testing

```sh
# requires a local Postgres with PostGIS available (defaults to postgres/password@localhost:5432)
pnpm --filter graphile-meta-schema test
```

If you want to explore the fixtures manually:

```sh
createdb metaschema_example
psql metaschema_example < sql/test.sql
psql metaschema_example < sql/types.sql
```
