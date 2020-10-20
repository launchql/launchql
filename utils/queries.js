import { gql } from 'graphile-test';

export const GetMetaSchemaUnion = gql`
  query MetaQuery {
    _meta {
      tables {
        name
        fields {
          name
          type {
            pg
            modifier
            typmod
            name
            subtype
          }
        }
        inflection {
          allRows
          createPayloadType
          orderByType
          tableType
          inputType
          patchType
          conditionType
          patchField
          edge
          connection
          allRowsSimple
          createField
          enumType
          deleteByPrimaryKey
          deletePayloadType
          tableFieldName
          typeName
          updateByPrimaryKey
          updatePayloadType
          createInputType
          edgeField
        }
        query {
          all
          one
          create
          update
          delete
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
                pg
                modifier
                typmod
                name
                subtype
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
                pg
                modifier
                typmod
                name
                subtype
              }
            }
          }
          ... on MetaschemaCheckConstraint {
            __typename
            name
            fields {
              name
              type {
                pg
                modifier
                typmod
                name
                subtype
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
