import { gql } from 'graphql-request';

export const getModuleDefinitionsQuery = gql`
  query getModuleDefinitionsQuery {
    moduleDefinitions {
      nodes {
        id
        name
        mods
        context
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
