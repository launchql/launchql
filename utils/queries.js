import { gql } from 'graphile-test';

export const GetProjectsAndLanguages = gql`
  query GetProjectsAndLanguagesQuery {
    allProjects {
      nodes {
        id
        name
        description
        localeStrings {
          langCode
          name
          description
        }
      }
    }
  }
`;
