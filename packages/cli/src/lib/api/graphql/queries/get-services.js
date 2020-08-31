import { gql } from 'graphql-request';

export const getServicesQuery = gql`
  query getServicesQuery($databaseId: UUID!) {
    services(condition: { databaseId: $databaseId }) {
      nodes {
        name
        id
        domain
        subdomain
        schemas
        roleName
        roleKey
        pubkeyChallenge
        isPublic
        dbname
        databaseId
        auth
        anonRole
      }
    }
  }
`;
