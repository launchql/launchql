# graphile-meta-schema

```sh
createdb metaschema_example
psql metaschema_example < schema.sql
```


## example query

```gql
query MyQuery {
  __typename
  _meta {
    tables {
      name
      constraints {
        ... on MetaschemaForeignKeyConstraint {
          fields {
            name
          }
          refTable {
            name
            constraints {
              __typename
            }
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
      }
      fields {
        name
        type {
          name
        }
      }
    }
  }
}

```