import { gql } from 'graphql-request';

export const DatabasesQuery = gql`
  query DatabasesQuery {
    databases {
      nodes {
        id
        name
      }
    }
  }
`;

export const SchemataQuery = gql`
  query SchemataQuery($databaseId: UUID!) {
    schemata(filter: { databaseId: { equalTo: $databaseId } }) {
      nodes {
        id
        databaseId
        name
      }
    }
  }
`;

export const TablesQuery = gql`
  query TablesQuery($databaseId: UUID!) {
    tables(filter: { databaseId: { equalTo: $databaseId } }) {
      nodes {
        id
        databaseId
        name
      }
    }
  }
`;
