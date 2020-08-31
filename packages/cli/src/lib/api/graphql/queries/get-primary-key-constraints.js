import { gql } from 'graphql-request';

export const primaryKeyConstraintsQuery = gql`
  query primaryKeyConstraintsQuery($tableId: UUID!) {
    primaryKeyConstraints(condition: { tableId: $tableId }) {
      nodes {
        id
        tableId
        fieldIds
      }
    }
  }
`;
