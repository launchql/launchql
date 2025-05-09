import { gql } from 'graphql-request';

export const createModuleMutation = gql`
  mutation createModuleMutation(
    $moduleDefnId: UUID!
    $databaseId: UUID!
    $context: String!
    $data: JSON!
  ) {
    installModule(
      input: {
        data: $data
        context: $context
        databaseId: $databaseId
        moduleDefnId: $moduleDefnId
      }
    ) {
      module {
        id
      }
    }
  }
`;
