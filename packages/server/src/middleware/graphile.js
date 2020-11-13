import { graphileCache, getRootPgPool } from '@launchql/server-utils';
import env from '../env';
import { postgraphile } from '@pyramation/postgraphile';
import PublicKeySignature from '../plugins/PublicKeySignature';
import { getGraphileSettings as getSettings } from '@launchql/graphile-settings';

export const graphile = ({
  simpleInflection,
  oppositeBaseNames,
  port,
  postgis,
  appendPlugins = [],
  graphileBuildOptions = {},
  overrideSettings = {}
}) => async (req, res, next) => {
  try {
    const svc = req.svc;
    const key = req.svc_key;

    const { schemas, dbname, anon_role, role_name } = svc;

    if (graphileCache.has(key)) {
      const { handler } = graphileCache.get(key);
      return handler(req, res, next);
    }

    const options = getSettings({
      host: env.SERVER_HOST,
      schema: schemas,
      port,
      simpleInflection,
      oppositeBaseNames,
      postgis
    });

    if (svc.pubkey_challenge?.length == 6) {
      options.appendPlugins.push(PublicKeySignature(svc));
    }

    if (appendPlugins.length) {
      [].push.apply(options.appendPlugins, appendPlugins);
    }

    // WE probably want people to be able to write their own auth?
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

    options.graphqlRoute = '/graphql';
    options.graphiqlRoute = '/graphiql';

    options.graphileBuildOptions = {
      ...options.graphileBuildOptions,
      ...graphileBuildOptions
    };

    const opts = {
      ...options,
      ...overrideSettings
    };

    const pgPool = getRootPgPool(dbname);
    const handler = postgraphile(pgPool, schemas, opts);

    graphileCache.set(key, {
      pgPool,
      handler
    });

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
