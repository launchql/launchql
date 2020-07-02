import { getGraphileSettings } from '@launchql/server';

const env = require('./env');

const getDbString = (db) =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${db}`;

export default ({ dbname, schemas, svc }) => {
  return {
    ...getGraphileSettings({
      simpleInflection: true,
      oppositeBaseNames: true,
      connection: getDbString(dbname),
      port: env.SERVER_PORT,
      host: env.SERVER_HOST,
      schema: schemas,
      svc
    }),
    graphqlRoute: '/graphql',
    graphiqlRoute: '/graphiql'
  };
};
