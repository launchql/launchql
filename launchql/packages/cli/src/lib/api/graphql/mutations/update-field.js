import { gql } from 'graphql-request';

export const updateFieldMutation = gql`
  mutation updateFieldMutation(
    $fieldId: UUID!
    $name: String
    $type: String
    $description: String
    $defaultValue: String
    $isRequired: Boolean
    $isHidden: Boolean
  ) {
    updateField(
      input: {
        id: $fieldId
        patch: {
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
