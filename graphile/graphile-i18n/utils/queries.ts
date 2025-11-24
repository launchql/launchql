import gql from 'graphql-tag';

export const GetProjectsAndLanguages = gql`
  query GetProjectsAndLanguagesQuery {
    projects {
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
