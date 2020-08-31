import { gql } from 'graphql-request';

export const createModuleMutation = gql`
  mutation createModuleMutation(
    $moduleDefnId: UUID!
    $databaseId: UUID!
    $data: JSON!
  ) {
    installModule(
      input: {
        data: $data
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
