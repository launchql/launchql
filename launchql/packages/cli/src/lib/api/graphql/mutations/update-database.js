import { gql } from 'graphql-request';

export const updateDatabaseMutation = gql`
  mutation updateDatabaseMutation($name: String, $id: UUID!) {
    updateDatabase(input: { id: $id, patch: { name: $name } }) {
      database {
        id
        name
      }
    }
  }
`;
