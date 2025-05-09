import { gql } from 'graphql-request';

export const createPrimaryKeyConstraintMutation = gql`
  mutation createPrimaryKeyConstraintMutation(
    $tableId: UUID!
    $fieldIds: [UUID]!
    $name: String!
  ) {
    createPrimaryKeyConstraint(
      input: {
        primaryKeyConstraint: {
          tableId: $tableId
          type: "p"
          name: $name
          fieldIds: $fieldIds
        }
      }
    ) {
      primaryKeyConstraint {
        id
        type
        name
        fieldIds
      }
    }
  }
`;
