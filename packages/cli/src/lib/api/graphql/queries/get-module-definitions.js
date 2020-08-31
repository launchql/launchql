import { gql } from 'graphql-request';

export const getModuleDefinitionsQuery = gql`
  query getModuleDefinitionsQuery {
    moduleDefinitions {
      nodes {
        id
        name
        mods
        fields: moduleFieldsByModuleDefnId {
          nodes {
            id
            name
            description
            isRequired
            defaultModuleId
            defaultModuleValue
          }
        }
      }
    }
  }
`;
