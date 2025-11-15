import gql from 'graphql-tag';

type GraphQLDocument = ReturnType<typeof gql>;

// DO NOT CHANGE TO domainBySubdomainAndDomain(domain: $domain, subdomain: $subdomain)
// condition is the way to handle since it will pass in null properly
// e.g. subdomain.domain or domain both work
export const ApiQuery: GraphQLDocument = gql`
  query ApiRoot($domain: String!, $subdomain: String) {
    domains(condition: { domain: $domain, subdomain: $subdomain }) {
      nodes {
        api {
          databaseId
          dbname
          roleName
          anonRole
          isPublic
          schemaNamesFromExt: apiExtensions {
            nodes {
              schemaName
            }
          }
          schemaNames: schemataByApiSchemaApiIdAndSchemaId {
            nodes {
              schemaName
            }
          }
          rlsModule {
            privateSchema {
              schemaName
            }
            authenticateStrict
            authenticate
            currentRole
            currentRoleId
          }
          database {
            sites {
              nodes {
                domains {
                  nodes {
                    subdomain
                    domain
                  }
                }
              }
            }
          } # for now keep this for patches
          apiModules {
            nodes {
              name
              data
            }
          }
        }
      }
    }
  }
`;

export const ApiByNameQuery: GraphQLDocument = gql`
  query ApiByName($name: String!, $databaseId: UUID!) {
    api: apiByDatabaseIdAndName(name: $name, databaseId: $databaseId) {
      databaseId
      dbname
      roleName
      anonRole
      isPublic
      schemaNamesFromExt: apiExtensions {
        nodes {
          schemaName
        }
      }
      schemaNames: schemataByApiSchemaApiIdAndSchemaId {
        nodes {
          schemaName
        }
      }
      rlsModule {
        privateSchema {
          schemaName
        }
        authenticate
        authenticateStrict
        currentRole
        currentRoleId
      }
      database {
        sites {
          nodes {
            domains {
              nodes {
                subdomain
                domain
              }
            }
          }
        }
      } # for now keep this for patches
      apiModules {
        nodes {
          name
          data
        }
      }
    }
  }
`;

export const ListOfAllDomainsOfDb: GraphQLDocument = gql`
  query ListApisByDatabaseId {
    apis {
      nodes {
        id
        databaseId
        name
        dbname
        roleName
        anonRole
        isPublic
        domains {
          nodes {
            domain
            subdomain
          }
        }
      }
    }
  }
`;
