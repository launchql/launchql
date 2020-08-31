import { gql } from 'graphql-request';

export const deleteTableMutation = gql`
  mutation deleteTableMutation($tableId: UUID!) {
    deleteTable(input: { id: $tableId }) {
      table {
        id
        name
      }
    }
  }
`;
