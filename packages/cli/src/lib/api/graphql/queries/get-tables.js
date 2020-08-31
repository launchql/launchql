import { gql } from 'graphql-request';

export const getTablesQuery = gql`
  query getTablesQuery($databaseId: UUID) {
    tables(condition: { databaseId: $databaseId }) {
      nodes {
        databaseId
        name
        id
        fields {
          nodes {
            id
            tableId
            name
            description
            defaultValue
            isHidden
            type
          }
        }
      }
    }
  }
`;
