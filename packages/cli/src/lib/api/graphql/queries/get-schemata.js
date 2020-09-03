import { gql } from 'graphql-request';

export const getSchemataQuery = gql`
  query SchemataQuery($databaseId: UUID!) {
    schemata(condition: { databaseId: $databaseId }) {
      nodes {
        id
        databaseId
        name
      }
    }
  }
`;
