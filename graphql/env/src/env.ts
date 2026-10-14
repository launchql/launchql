import { ConstructiveOptions } from '@constructive-io/graphql-types';
import { parseEnvBoolean, parseEnvNumber } from '12factor-env';

import {
  normalizeGrafastCacheLimits,
  parseGrafastCacheLimitEnv
} from './grafast-cache-limits';
import { getScopedIntrospectionEnv } from './scoped-introspection';

/**
 * @param env - Environment object to read from (defaults to process.env for backwards compatibility)
 */
export const getGraphQLEnvVars = (env: NodeJS.ProcessEnv = process.env): Partial<ConstructiveOptions> => {
  const scopedIntrospection = getScopedIntrospectionEnv(env);
  const {
    GRAPHILE_SCHEMA,
    GRAPHILE_EXPLAIN,
    GRAPHILE_QUERY_CACHE_MAX_LENGTH,
    GRAPHILE_OPERATIONS_CACHE_MAX_LENGTH,
    GRAPHILE_OPERATION_PLANS_CACHE_MAX_LENGTH,

    FEATURES_SIMPLE_INFLECTION,
    FEATURES_OPPOSITE_BASE_NAMES,
    FEATURES_POSTGIS,

    API_ROUTING_SCHEMA,
    API_IS_PUBLIC,
    API_EXPOSED_SCHEMAS,
    API_META_SCHEMAS,
    API_ANON_ROLE,
    API_ROLE_NAME,
    API_FLUSH_TOKEN,
    API_INTROSPECTION_ROLE,

    EMBEDDER_PROVIDER,
    EMBEDDER_MODEL,
    EMBEDDER_BASE_URL,
    CHAT_PROVIDER,
    CHAT_MODEL,
    CHAT_BASE_URL,

    SMS_PROVIDER,
    SMS_SENDER_ID,
    SMS_REQUEST_TIMEOUT_MS,
    SEND_SMS_DRY_RUN,
    DEVSMS_BASE_URL
  } = env;

  // Keep this function as a partial env-override parser. SMS runtime defaults
  // belong to the consuming application; injecting them here would incorrectly
  // let an absent env var overwrite pgpm.json or consumer-specific values.
  const smsRequestTimeoutMs = parseEnvNumber(SMS_REQUEST_TIMEOUT_MS);
  const smsDryRun = parseEnvBoolean(SEND_SMS_DRY_RUN);
  const hasGrafastCacheLimits = [
    GRAPHILE_QUERY_CACHE_MAX_LENGTH,
    GRAPHILE_OPERATIONS_CACHE_MAX_LENGTH,
    GRAPHILE_OPERATION_PLANS_CACHE_MAX_LENGTH
  ].some(value => value !== undefined);
  const hasSmsEnvOverrides = Boolean(
    SMS_PROVIDER ||
    SMS_SENDER_ID ||
    smsRequestTimeoutMs !== undefined ||
    smsDryRun !== undefined ||
    DEVSMS_BASE_URL
  );

  return {
    graphile: {
      ...(scopedIntrospection !== undefined && {
        preset: {
          gather: {
            pgScopedIntrospection: { main: scopedIntrospection }
          }
        }
      }),
      ...(hasGrafastCacheLimits && {
        grafastCache: normalizeGrafastCacheLimits({
          queryCacheMaxLength: parseGrafastCacheLimitEnv(
            GRAPHILE_QUERY_CACHE_MAX_LENGTH,
            'GRAPHILE_QUERY_CACHE_MAX_LENGTH'
          ),
          operationsCacheMaxLength: parseGrafastCacheLimitEnv(
            GRAPHILE_OPERATIONS_CACHE_MAX_LENGTH,
            'GRAPHILE_OPERATIONS_CACHE_MAX_LENGTH'
          ),
          operationOperationPlansCacheMaxLength: parseGrafastCacheLimitEnv(
            GRAPHILE_OPERATION_PLANS_CACHE_MAX_LENGTH,
            'GRAPHILE_OPERATION_PLANS_CACHE_MAX_LENGTH'
          )
        })
      }),
      ...(GRAPHILE_EXPLAIN && { explain: parseEnvBoolean(GRAPHILE_EXPLAIN) }),
      ...(GRAPHILE_SCHEMA && {
        schema: GRAPHILE_SCHEMA.includes(',')
          ? GRAPHILE_SCHEMA.split(',').map(s => s.trim())
          : GRAPHILE_SCHEMA
      })
    },
    features: {
      ...(FEATURES_SIMPLE_INFLECTION && { simpleInflection: parseEnvBoolean(FEATURES_SIMPLE_INFLECTION) }),
      ...(FEATURES_OPPOSITE_BASE_NAMES && { oppositeBaseNames: parseEnvBoolean(FEATURES_OPPOSITE_BASE_NAMES) }),
      ...(FEATURES_POSTGIS && { postgis: parseEnvBoolean(FEATURES_POSTGIS) })
    },
    api: {
      ...(API_ROUTING_SCHEMA && { routingSchema: API_ROUTING_SCHEMA }),
      ...(API_IS_PUBLIC && { isPublic: parseEnvBoolean(API_IS_PUBLIC) }),
      ...(API_EXPOSED_SCHEMAS && { exposedSchemas: API_EXPOSED_SCHEMAS.split(',').map(s => s.trim()) }),
      ...(API_META_SCHEMAS && { metaSchemas: API_META_SCHEMAS.split(',').map(s => s.trim()) }),
      ...(API_ANON_ROLE && { anonRole: API_ANON_ROLE }),
      ...(API_ROLE_NAME && { roleName: API_ROLE_NAME }),
      ...(API_FLUSH_TOKEN && { flushToken: API_FLUSH_TOKEN }),
      ...(API_INTROSPECTION_ROLE && { introspectionRole: API_INTROSPECTION_ROLE })
    },
    ...((EMBEDDER_PROVIDER || CHAT_PROVIDER) && {
      llm: {
        ...((EMBEDDER_PROVIDER || EMBEDDER_MODEL || EMBEDDER_BASE_URL) && {
          embedder: {
            ...(EMBEDDER_PROVIDER && { provider: EMBEDDER_PROVIDER }),
            ...(EMBEDDER_MODEL && { model: EMBEDDER_MODEL }),
            ...(EMBEDDER_BASE_URL && { baseUrl: EMBEDDER_BASE_URL })
          }
        }),
        ...((CHAT_PROVIDER || CHAT_MODEL || CHAT_BASE_URL) && {
          chat: {
            ...(CHAT_PROVIDER && { provider: CHAT_PROVIDER }),
            ...(CHAT_MODEL && { model: CHAT_MODEL }),
            ...(CHAT_BASE_URL && { baseUrl: CHAT_BASE_URL })
          }
        })
      }
    }),
    ...(hasSmsEnvOverrides && {
      sms: {
        ...(SMS_PROVIDER && { provider: SMS_PROVIDER }),
        ...(SMS_SENDER_ID && { senderId: SMS_SENDER_ID }),
        ...(smsRequestTimeoutMs !== undefined && {
          requestTimeoutMs: smsRequestTimeoutMs
        }),
        ...(smsDryRun !== undefined && { dryRun: smsDryRun }),
        ...(DEVSMS_BASE_URL && {
          devsms: {
            baseUrl: DEVSMS_BASE_URL
          }
        })
      }
    })
  };
};
