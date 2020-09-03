import { gql } from 'graphql-request';

export const createFieldMutation = gql`
  mutation createFieldMutation(
    $tableId: UUID!
    $name: String!
    $type: String!
    $description: String
    $defaultValue: String
    $isRequired: Boolean
    $isHidden: Boolean
  ) {
    createField(
      input: {
        field: {
          tableId: $tableId
          name: $name
          type: $type
          defaultValue: $defaultValue
          description: $description
          isRequired: $isRequired
          isHidden: $isHidden
        }
      }
    ) {
      field {
        id
        tableId
        name
        description
        type
        isRequired
        isHidden
        defaultValue
      }
    }
  }
`;
