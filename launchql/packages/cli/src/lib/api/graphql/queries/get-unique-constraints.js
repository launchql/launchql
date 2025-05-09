import { gql } from 'graphql-request';

export const uniqueConstraintsQuery = gql`
  query uniqueConstraintsQuery($tableId: UUID!) {
    uniqueConstraints(condition: { tableId: $tableId }) {
      nodes {
        id
        tableId
        fieldIds
      }
    }
  }
`;
