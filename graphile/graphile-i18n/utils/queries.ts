import gql from 'graphql-tag';

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
