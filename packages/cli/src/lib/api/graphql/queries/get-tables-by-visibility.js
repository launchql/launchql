import { gql } from 'graphql-request';

export const getTablesByVisibilityQuery = gql`
  query getTablesByVisibilityQuery($databaseId: UUID!, $isVisible: Boolean!) {
    tables(condition: { databaseId: $databaseId, isVisible: $isVisible }) {
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
