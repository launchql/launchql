import { setConfig } from '../../env';

export default async (ctx, args) => {
  const config = {
    apiVersion: 'v1',
    servers: [
      {
        name: 'local',
        env: 'development',
        endpoints: {
          db: 'http://collections.launchql.localhost:5555/graphql',
          svc: 'http://services.launchql.localhost:5555/graphql',
          mods: 'http://mods.launchql.localhost:5555/graphql',
          migrate: 'http://migrate.launchql.localhost:5555/graphql'
        }
      }
    ],
    contexts: [
      {
        name: 'local-dev',
        server: 'local',
        user: 'user'
      }
    ],
    currentContext: 'local-dev',
    users: [
      {
        name: 'user'
      }
    ]
  };

  await setConfig(config);
};
