import gql from 'graphql-tag';

export const ApiQuery = gql`
  query Api($domain: String!, $subdomain: String!) {
    domain: domainBySubdomainAndDomain(domain: $domain, subdomain: $subdomain) {
      api {
        dbname
        schemas
        roleName
        anonRole
        apiModules {
          nodes {
            name
            data
          }
        }
      }
    }
  }
`;
