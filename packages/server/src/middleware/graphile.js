import { cache, getRootPgPool } from '@launchql/server-utils';
import env from '../env';
import { postgraphile } from '@pyramation/postgraphile';
import PublicKeySignature from '../plugins/PublicKeySignature';
import { getGraphileSettings as getSettings } from '@launchql/graphile-settings';

export const getGraphileSettings = ({
  host,
  port,
  schema,
  simpleInflection,
  oppositeBaseNames,
  postgis,
  svc
}) => {
  const options = getSettings({
    host,
    port,
    schema,
    simpleInflection,
    oppositeBaseNames,
    postgis
  });

  const { anon_role, role_name } = svc;

  if (svc.pubkey_challenge?.length == 6) {
    options.appendPlugins.push(PublicKeySignature(svc));
  }

  options.pgSettings = async function pgSettings(req) {
    if (req?.token?.user_id) {
      return {
        role: role_name,
        [`jwt.claims.user_id`]: req.token.user_id,
        [`jwt.claims.group_ids`]: '{' + req.token.user_id + '}'
      };
    }
    return { role: anon_role };
  };

  return options;
};

export const graphile = (getGraphile) => async (req, res, next) => {
  try {
    const { handler } = await getGraphile(req);

    if (req.originalUrl === '/') {
      const schemaNotIntrospected = await handler.getGraphQLSchema();
      const host = req.get('host');
      return res.send({
        api: `${req.protocol}://${host}/graphiql`,
        schema: schemaNotIntrospected
      });
    }
    return handler(req, res, next);
  } catch (e) {
    // TODO update graphile... why do we not catch
    // this error!
    return res.status(500).send(e.message);
  }
};

export const getGraphileInstanceObj = ({
  simpleInflection,
  oppositeBaseNames,
  port,
  postgis
}) => async (req) => {
  const svc = req.svc;

  const { schemas, dbname } = svc;

  const key = req.svc_key;

  if (cache.has(key)) {
    return cache.get(key);
  }

  const opts = {
    ...getGraphileSettings({
      simpleInflection,
      oppositeBaseNames,
      port,
      host: env.SERVER_HOST,
      schema: schemas,
      svc,
      postgis
    }),
    graphqlRoute: '/graphql',
    graphiqlRoute: '/graphiql'
  };

  const pgPool = getRootPgPool(dbname);

  const obj = {
    pgPool,
    handler: postgraphile(pgPool, schemas, opts)
  };

  cache.set(key, obj);
  return obj;
};
