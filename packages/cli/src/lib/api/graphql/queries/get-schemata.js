import { gql } from 'graphql-request';

export const getSchemataQuery = gql`
  query SchemataQuery($databaseId: UUID!) {
    schemata(filter: { databaseId: { equalTo: $databaseId } }) {
      nodes {
        id
        databaseId
        name
      }
    }
  }
`;
