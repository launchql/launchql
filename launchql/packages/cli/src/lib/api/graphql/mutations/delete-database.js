import { gql } from 'graphql-request';

export const deleteDatabaseMutation = gql`
  mutation deleteDatabaseMutation($id: UUID!) {
    deleteDatabase(input: { id: $id }) {
      database {
        id
        name
      }
    }
  }
`;
