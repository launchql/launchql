import { gql } from 'graphql-request';

export const getModuleOutputsByDefinitionsIds = gql`
  query getModuleOutputsByDefinitionsIds(
    $databaseId: UUID!
    $moduleDefnIds: [UUID!]
  ) {
    moduleDefinitions(filter: { id: { in: $moduleDefnIds } }) {
      nodes {
        id
        name
        modules: modulesByModuleDefnId(condition: { databaseId: $databaseId }) {
          nodes {
            id
            databaseId
            outputs: moduleOutputs {
              nodes {
                name
                value
              }
            }
          }
        }
      }
    }
  }
`;
