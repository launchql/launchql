import { gql } from 'graphql-request';

export const createTableMutation = gql`
  mutation createTableMutation($name: String!, $databaseId: UUID!) {
    createTable(
      input: {
        table: {
          databaseId: $databaseId
          name: $name
          pluralName: $name
          singularName: $name
        }
      }
    ) {
      table {
        id
        name
      }
    }
  }
`;
