import { gql } from 'graphql-request';

export const getDatabasesQuery = gql`
  query getDatabases {
    databases {
      totalCount
      nodes {
        id
        name
      }
    }
  }
`;
