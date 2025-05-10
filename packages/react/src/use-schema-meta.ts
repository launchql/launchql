// @ts-nocheck
import { useEffect } from 'react';
import { gql } from 'graphql-request';
import { useQuery } from 'react-query';
import { useGraphqlClient } from './use-graphql-client';

const fieldFragment = `
  name
  type {
    gqlType
    isArray
    modifier
    pgAlias
    pgType
    subtype
    typmod
  }
`;

const queryFragment = `
  query {
    all
    create
    delete
    one
    update
  }
`;

const primaryConstraintsFragment = `
  primaryKeyConstraints {
    name
    fields {
      ${fieldFragment}
    }
  }
`;

const foreignKeyConstraintsFragments = `
  foreignKeyConstraints {
    name
    fields {
      ${fieldFragment}
    }
    refFields {
      ${fieldFragment}
    }
    refTable {
      name
    }
  }
`;

const inflectionFragment = `
  inflection {
    allRows
    allRowsSimple
    conditionType
    connection
    createField
    createInputType
    createPayloadType
    deleteByPrimaryKey
    deletePayloadType
    edge
    edgeField
    enumType
    filterType
    inputType
    orderByType
    patchField
    patchType
    tableFieldName
    tableType
    typeName
    updateByPrimaryKey
    updatePayloadType
  }
`;

const metaQuery = gql`
  query SchemaMetaQuery {
    _meta {
      tables {
        name
        ${queryFragment}

        ${inflectionFragment}

        fields {
          ${fieldFragment}
        }

        ${primaryConstraintsFragment}

        ${foreignKeyConstraintsFragments}

        uniqueConstraints {
          name
          fields {
            ${fieldFragment}
          }
        }

        relations {
          belongsTo {
            fieldName
            isUnique
            type
            keys {
              ${fieldFragment}
            }
            references {
              name
              fields {
                ${fieldFragment}
              }
            }
          }
          has {
            fieldName
            isUnique
            type
            keys {
              ${fieldFragment}
            }
            referencedBy {
              name
              fields {
                ${fieldFragment}
              }
              ${primaryConstraintsFragment}
              ${foreignKeyConstraintsFragments}
            }
          }
          hasMany {
            fieldName
            isUnique
            type
            keys {
              ${fieldFragment}
            }
            referencedBy {
              name
              fields {
                ${fieldFragment}
              }
              ${primaryConstraintsFragment}
              ${foreignKeyConstraintsFragments}
            }
          }
          hasOne {
            fieldName
            isUnique
            type
            keys {
              ${fieldFragment}
            }
            referencedBy {
              name
              fields {
                ${fieldFragment}
              }
              ${primaryConstraintsFragment}
              ${foreignKeyConstraintsFragments}
            }
          }
          manyToMany {
            fieldName
            type
            leftKeyAttributes {
              ${fieldFragment}
            }
            rightKeyAttributes {
              ${fieldFragment}
            }
            junctionTable {
              name
              fields {
                ${fieldFragment}
              }
              ${queryFragment}
              ${primaryConstraintsFragment}
              ${foreignKeyConstraintsFragments}
            }
            rightTable {
              name
              fields {
                ${fieldFragment}
              }
              ${queryFragment}
              ${primaryConstraintsFragment}
              ${foreignKeyConstraintsFragments}
            }
          }
        }
      }
    }
  }
`;

export function useSchemaMeta({
  tableName,
  onSuccess,
  onError,
  headers,
  ...restOptions
} = {}) {
  const graphqlClient = useGraphqlClient();

  useEffect(() => {
    if (headers && graphqlClient) {
      graphqlClient.setHeaders(headers);
    }
  }, [graphqlClient, headers]);

  const { data, refetch, ...otherProps } = useQuery(
    'schemaMeta',
    async () => {
      return await graphqlClient.request(metaQuery);
    },
    {
      onError,
      onSuccess,
      ...restOptions,
      // The query will not execute until the graphqlClient exists
      enabled: !!graphqlClient,
      // SQL schema rarely changes, so we don't want it to invalidate too often
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false
    }
  );

  return {
    ...otherProps,
    refetch,
    data: tableName ? data?._meta?.tables[tableName] : data?._meta
  };
}
