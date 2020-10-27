import { gql } from 'graphile-test';

export const GetMetaSchemaUnion = gql`
  query MetaQuery {
    _meta {
      tables {
        name
        fields {
          name
          type {
            pgType
            pgAlias
            gqlType
            modifier
            typmod
            subtype
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
                pgType
                gqlType
                pgAlias
                modifier
                typmod
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
                pgType
                gqlType
                pgAlias
                modifier
                typmod
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
                pgType
                gqlType
                pgAlias
                modifier
                typmod
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

export const GetMetaRelations = gql`
  query MetaQuery {
    _meta {
      tables {
        name
        relations {
          manyToMany {
            query
            leftKeyAttributes {
              name
            }
            junctionLeftKeyAttributes {
              name
            }
            junctionRightKeyAttributes {
              name
            }
            rightKeyAttributes {
              name
            }
            junctionTable {
              name
            }
            rightTable {
              name
            }
            junctionLeftConstraint {
              refTable {
                name
              }
              fields {
                name
              }
            }
            junctionRightConstraint {
              refTable {
                name
              }
              fields {
                name
              }
            }
          }
        }
      }
    }
  }
`;

export const GetMetaInflection = gql`
  query MetaQuery {
    _meta {
      tables {
        name
        inflection {
          allRows
          createPayloadType
          orderByType
          filterType
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
      }
    }
  }
`;
