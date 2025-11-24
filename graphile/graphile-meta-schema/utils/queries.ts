import type { DocumentNode } from 'graphql';
import gql from 'graphql-tag';

export const GetMetaSchemaUnion: DocumentNode = gql`
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

export const GetMetaSchema: DocumentNode = gql`
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

export const GetMetaInflection: DocumentNode = gql`
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

export const GetHasOneRelations: DocumentNode = gql`
  query HasOneQuery {
    _meta {
      tables {
        name
        relations {
          hasOne {
            referencedBy {
              name
            }
            isUnique
            fieldName
            type
            keys {
              name
            }
          }
        }
      }
    }
  }
`;

export const GetHasManyRelations: DocumentNode = gql`
  query HasMany {
    _meta {
      tables {
        name
        relations {
          hasMany {
            fieldName
            type
            referencedBy {
              name
            }
            isUnique
            keys {
              name
            }
          }
        }
      }
    }
  }
`;

export const GetBelongsToRelations: DocumentNode = gql`
  query BelongsTo {
    _meta {
      tables {
        name
        relations {
          belongsTo {
            fieldName
            type
            references {
              name
            }
            isUnique
            keys {
              name
            }
          }
        }
      }
    }
  }
`;

export const GetManyToManyRelations: DocumentNode = gql`
  query MetaQuery {
    _meta {
      tables {
        name
        relations {
          manyToMany {
            fieldName
            type
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
