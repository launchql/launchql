import { gql } from 'graphql-request';

export const createDatabaseMutation = gql`
  mutation createDatabaseMutation($name: String!) {
    createDatabase(input: { database: { name: $name } }) {
      database {
        id
        name
      }
    }
  }
`;
