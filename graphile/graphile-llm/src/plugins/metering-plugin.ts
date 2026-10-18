/**
 * LlmMeteringPlugin
 *
 * Opt-in billing integration for graphile-llm. Completely separate from the
 * pure LLM plugins (text-search, text-mutation, rag).
 *
 * **How it works:**
 * 1. At schema build time, replaces `build.llmEmbedder` with a metered wrapper
 *    that has the same `(text: string) => Promise<number[]>` signature
 * 2. At request time, wraps every root query/mutation resolver to set up a
 *    request-scoped MeteringContext via AsyncLocalStorage
 * 3. When the embedder is called (by any plugin), the wrapper checks
 *    AsyncLocalStorage for a metering context and if found, calls
 *    check_billing_quota before and record_usage after
 * 4. If quota is exceeded, the wrapper returns null — the calling plugin sees
 *    null and handles it (search falls back to text-only, mutations throw)
 *
 * The pure plugins never import metering, config-cache, or billing types.
 * They call the embedder and handle null results — that's it.
 *
 * **Entity ID resolution:**
 * The billing `entity_id` is resolved via a configurable callback.
 * Default: reads `jwt.claims.user_id` from pgSettings. Override via
 * `metering.resolveEntityId` in GraphileLlmPreset options.
 *
 * **Graceful behavior:**
 * - billing_module not provisioned → embedder passes through unmetered
 * - entity_id not available → embedder passes through unmetered
 * - check_billing_quota throws → call is allowed (billing is opt-in)
 * - record_usage throws → call succeeds, recording silently skipped
 * - quota exceeded → embedder returns null
 */

import { AsyncLocalStorage } from 'node:async_hooks';

import type { GraphileConfig } from 'graphile-config';

import type { PgClient } from '../config-cache';
import { getLlmBillingConfig } from '../config-cache';
import type { MeteringContext, MeteringOptions, WithPgClient } from '../metering';
import { meteredEmbed } from '../metering';
import type { EmbedderFunction, MeteringConfig } from '../types';

// ─── TypeScript Augmentation ────────────────────────────────────────────────

declare global {
  namespace GraphileConfig {
    interface Plugins {
      LlmMeteringPlugin: true;
    }
  }
}

// ─── Request-scoped context via AsyncLocalStorage ───────────────────────────

const meteringStore = new AsyncLocalStorage<MeteringContext | null>();

// ─── Helpers ────────────────────────────────────────────────────────────────

function defaultResolveEntityId(pgSettings: Record<string, string>): string | null {
  return pgSettings['jwt.claims.user_id'] ?? null;
}

async function buildMeteringContext(
  graphqlContext: any,
  resolveEntityId: (pgSettings: Record<string, string>) => string | null,
  cacheScope: object
): Promise<MeteringContext | null> {
  const pgSettings: Record<string, string> = graphqlContext?.pgSettings ?? {};
  const entityId = resolveEntityId(pgSettings);
  const databaseId = pgSettings['jwt.claims.database_id'] ?? null;
  const requestId = pgSettings['request.id'] ?? null;
  const actorId = pgSettings['jwt.claims.user_id'] ?? null;
  if (!entityId || !databaseId) return null;

  const withPgClient: WithPgClient | undefined = graphqlContext?.withPgClient;
  if (!withPgClient) return null;

  let billingConfig = null;
  let inferenceLogConfig = null;
  try {
    await withPgClient(pgSettings, async (pgClient: PgClient) => {
      const entry = await getLlmBillingConfig(pgClient, databaseId, cacheScope);
      billingConfig = entry.billing;
      inferenceLogConfig = entry.inferenceLog;
    });
  } catch {
    return null;
  }

  if (!billingConfig) return null;

  return {
    withPgClient,
    pgSettings,
    billing: billingConfig,
    entityId,
    requestId,
    databaseId,
    actorId,
    inferenceLog: inferenceLogConfig
  };
}

/**
 * Wrap an embedder with metering that reads context from AsyncLocalStorage.
 * The returned function has the same signature as the original embedder,
 * so downstream plugins are unaware of billing.
 *
 * When no metering context is in scope, the original embedder is called directly.
 * When quota is exceeded, returns null instead of a vector.
 */
function wrapEmbedderWithMetering(
  embedder: EmbedderFunction,
  meteringOptions: MeteringOptions
): (text: string) => Promise<number[] | null> {
  return async (text: string): Promise<number[] | null> => {
    const ctx = meteringStore.getStore();

    if (!ctx) {
      // No metering context in scope — call original embedder directly
      const startTime = Date.now();
      const { embedding } = await embedder(text);
      const latencyMs = Date.now() - startTime;
      console.log(`[graphile-llm] Embed (unmetered): dims=${embedding?.length ?? 0}, latency=${latencyMs}ms`);
      return embedding;
    }

    const result = await meteredEmbed(embedder, text, ctx, meteringOptions);

    if (result.quotaExceeded) {
      return null;
    }

    return result.result;
  };
}

// ─── Plugin ─────────────────────────────────────────────────────────────────

export function createLlmMeteringPlugin(
  meteringConfig: MeteringConfig = {}
): GraphileConfig.Plugin {
  const {
    embeddingMeterSlug: configEmbeddingSlug,
    chatMeterSlug: configChatSlug,
    skipMetering,
    resolveEntityId = defaultResolveEntityId
  } = meteringConfig;

  return {
    name: 'LlmMeteringPlugin',
    version: '0.2.0',
    description:
      'Wraps LLM embedder/chat with billing quota checks and usage recording',
    after: ['LlmModulePlugin'],
    before: ['LlmTextSearchPlugin', 'LlmTextMutationPlugin', 'LlmRagPlugin'],

    schema: {
      hooks: {
        build(build) {
          const originalEmbedder: EmbedderFunction | null = (build as any).llmEmbedder;

          if (!originalEmbedder) {
            console.log('[graphile-llm] Metering plugin loaded but no embedder configured — skipping');
            return build;
          }

          // Meter slug = model name by default (three-level waterfall: model → inference → universal)
          const embeddingModel: string | null = (build as any).llmEmbeddingModel;
          const chatModel: string | null = (build as any).llmChatModel;
          const embeddingSlug = configEmbeddingSlug ?? embeddingModel ?? undefined;
          const chatSlug = configChatSlug ?? chatModel ?? undefined;

          if (embeddingSlug) {
            console.log(`[graphile-llm] Metering enabled — embedding meter: ${embeddingSlug}`);
          } else {
            console.log('[graphile-llm] Metering enabled but no embedding model name — usage will not be metered');
          }

          const meteringOptions: MeteringOptions = {
            embeddingMeterSlug: embeddingSlug,
            chatMeterSlug: chatSlug,
            skipMetering,
            embeddingModel: embeddingModel ?? undefined,
            chatModel: chatModel ?? undefined
          };

          // Replace the embedder with a metered version.
          // Same signature except it can return null (quota exceeded).
          const meteredEmbedder = wrapEmbedderWithMetering(originalEmbedder, meteringOptions);

          return build.extend(build, {
            llmEmbedder: meteredEmbedder as unknown as EmbedderFunction
          }, 'LlmMeteringPlugin replacing llmEmbedder with metered version');
        },

        /**
         * Wrap every root query/mutation resolver to establish the
         * request-scoped metering context via AsyncLocalStorage.
         */
        GraphQLObjectType_fields_field(field, build, context) {
          const {
            scope: { isRootQuery, isRootMutation }
          } = context as any;

          if (!isRootQuery && !isRootMutation) return field;

          // Only wrap if we actually replaced the embedder
          if (!(build as any).llmEmbedder) return field;

          const defaultResolver = (obj: any) => obj[(context as any).scope.fieldName];
          const { resolve: oldResolve = defaultResolver, ...rest } = field;

          return {
            ...rest,
            async resolve(source: any, args: any, graphqlContext: any, info: any) {
              // Build the metering context for this request
              const ctx = await buildMeteringContext(
                graphqlContext,
                resolveEntityId,
                build
              );

              // Run the original resolver within the AsyncLocalStorage scope
              // so any embedder calls made by downstream plugins pick up the ctx
              return meteringStore.run(ctx, () => {
                return oldResolve(source, args, graphqlContext, info);
              });
            }
          };
        }
      }
    }
  };
}
