import { gql } from 'graphql-request';

export const updateTableMutation = gql`
  mutation updateTableMutation($name: String, $isVisible: Boolean, $id: UUID!) {
    updateTable(
      input: {
        id: $id
        patch: {
          name: $name
          isVisible: $isVisible
          pluralName: $name
          singularName: $name
        }
      }
    ) {
      table {
        id
        name
        isVisible
      }
    }
  }
`;
