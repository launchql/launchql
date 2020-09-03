import { gql } from 'graphql-request';

export const createUniqueConstraintMutation = gql`
  mutation createUniqueConstraintMutation(
    $tableId: UUID!
    $fieldIds: [UUID]!
    $name: String!
  ) {
    createUniqueConstraint(
      input: {
        uniqueConstraint: {
          tableId: $tableId
          type: "u"
          name: $name
          fieldIds: $fieldIds
        }
      }
    ) {
      uniqueConstraint {
        id
        type
        name
        fieldIds
      }
    }
  }
`;
