import { gql } from 'graphile-test';

export const GetMetaSchemaUnion = gql`
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
        inflection {
          allRows
          tableFieldName
          tableType
          createPayloadType
          updatePayloadType
          deletePayloadType
          updateByPrimaryKey
          deleteByPrimaryKey
          createField
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
`;

export const GetMetaSchema = gql`
  query MetaQuery {
    _meta {
      tables {
        name
        foreignKeyConstraints {
          name
        }
        primaryKeyConstraints {
          name
        }
        uniqueConstraints {
          name
        }
      }
    }
  }
`;
