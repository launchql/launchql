import { gql } from 'graphql-request';

export const constraintsQuery = gql`
  query constraintsQuery($tableId: UUID!) {
    constraints(condition: { tableId: $tableId }) {
      nodes {
        id
        name
        type
      }
    }
  }
`;
