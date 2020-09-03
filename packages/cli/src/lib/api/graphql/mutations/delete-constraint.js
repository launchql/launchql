import { gql } from 'graphql-request';

export const deleteConstraintMutation = gql`
  mutation deleteConstraintMutation($id: UUID!) {
    deleteConstraint(input: { id: $id }) {
      deletedConstraintNodeId
      constraint {
        id
        tableId
        name
        type
      }
    }
  }
`;
