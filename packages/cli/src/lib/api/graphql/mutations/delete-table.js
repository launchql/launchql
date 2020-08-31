import { gql } from 'graphql-request';

export const deleteTableMutation = gql`
  mutation deleteTableMutation($id: UUID!) {
    deleteTable(input: { id: $id }) {
      table {
        id
        name
      }
    }
  }
`;
