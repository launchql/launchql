import { gql } from 'graphql-request';

export const getDatabaseQuery = gql`
  query getDatabase($databaseId: UUID!) {
    database(id: $databaseId) {
      id
      name
      schemaName
      privateSchemaName
      tables {
        totalCount
        nodes {
          id
          name
        }
      }
    }
  }
`;
