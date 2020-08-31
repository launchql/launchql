import { gql } from 'graphql-request';

export const deleteFieldMutation = gql`
  mutation deleteFieldMutation($id: UUID!) {
    deleteField(input: { id: $id }) {
      field {
        id
        name
      }
    }
  }
`;
