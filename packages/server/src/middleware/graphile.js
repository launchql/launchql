import env from '../env';
import { graphileCache, getRootPgPool } from '@launchql/server-utils';
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
    const api = req.apiInfo.data.api;
    const key = req.svc_key;
    const { dbname } = api;
    const { schemas, anonRole, roleName } = api;

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

    const pubkey_challenge = api.apiModules.nodes.find(
      (mod) => mod.name === 'pubkey_challenge'
    );

    if (pubkey_challenge && pubkey_challenge.data) {
      options.appendPlugins.push(PublicKeySignature(pubkey_challenge.data));
    }

    if (appendPlugins.length) {
      [].push.apply(options.appendPlugins, appendPlugins);
    }

    // WE probably want people to be able to write their own auth?
    options.pgSettings = async function pgSettings(req) {
      if (req?.token?.user_id) {
        return {
          role: roleName,
          [`jwt.claims.user_id`]: req.token.user_id,
          [`jwt.claims.group_ids`]: '{' + req.token.user_id + '}'
        };
      }
      return { role: anonRole };
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

    return handler(req, res, next);
  } catch (e) {
    // TODO update graphile... why do we not catch
    // this error!
    return res.status(500).send(e.message);
  }
};
