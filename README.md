# graphile-meta-schema [![Build Status](https://travis-ci.org/pyramation/graphile-meta-schema.svg?branch=master)](https://travis-ci.org/pyramation/graphile-meta-schema)

```sh
npm install graphile-meta-schema 
```

## example query

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

## testing

```sh
createdb metaschema_example
psql metaschema_example < sql/test.sql
```
