import { gql } from 'graphql-request';

export const updateConstraintMutation = gql`
  mutation updateConstraintMutation($id: UUID!, $name: String, $type: String) {
    updateConstraint(input: { id: $id, patch: { name: $name, type: $type } }) {
      constraint {
        id
        type
        name
      }
    }
  }
`;
