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
    const { anonRole, roleName } = api;

    const { schemaNamesFromExt, schemaNames } = api;
    const schemas = []
      .concat(schemaNamesFromExt.nodes.map(({ schemaName }) => schemaName))
      .concat(schemaNames.nodes.map(({ schemaName }) => schemaName));

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
      const context = {
        [`jwt.claims.database_id`]: req.databaseId,
        [`jwt.claims.ip_address`]: req.clientIp
      };

      // NOTE: ONLY set if it's not null
      if (req.get('origin')) {
        context['jwt.claims.origin'] = req.get('origin');
      }
      if (req.get('User-Agent')) {
        context['jwt.claims.user_agent'] = req.get('User-Agent');
      }
      if (req?.token?.user_id) {
        return {
          role: roleName,
          [`jwt.claims.token_id`]: req.token.id,
          [`jwt.claims.user_id`]: req.token.user_id,
          ...context
        };
      }
      return { role: anonRole, ...context };
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
