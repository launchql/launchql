import { gql } from 'graphql-request';

export const createForeignKeyConstraintMutation = gql`
  mutation createForeignKeyConstraintMutation(
    $tableId: UUID!
    $fieldId: UUID!
    $refTableId: UUID!
    $refFieldId: UUID!
    $name: String!
  ) {
    createForeignKeyConstraint(
      input: {
        foreignKeyConstraint: {
          type: "f"
          name: $name
          tableId: $tableId
          fieldId: $fieldId
          refTableId: $refTableId
          refFieldId: $refFieldId
        }
      }
    ) {
      foreignKeyConstraint {
        id
        tableId
        name
        type
        fieldId
        refTableId
        refFieldId
      }
    }
  }
`;
