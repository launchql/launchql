import { gql } from 'graphql-request';

export const getTableQuery = gql`
  query getTableQuery($tableId: UUID!) {
    table(id: $tableId) {
      id
      databaseId
      isVisible
      name
      pluralName
      singularName
      description
      fields {
        totalCount
        nodes {
          id
          tableId
          name
          fieldOrder
          description
          defaultValue
          isHidden
          isRequired
          isArray
          type
        }
      }
    }
  }
`;
