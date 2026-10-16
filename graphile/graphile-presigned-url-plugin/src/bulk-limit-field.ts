/**
 * maxBulkFiles Field Plugin
 *
 * Adds `maxBulkFiles: Int!` to bucket types tagged `@storageBuckets`: the most
 * files one bulk-upload call accepts. It is the storage module's
 * `max_bulk_files`, or the default when the column is unset — the same value
 * the bulk mutation enforces, read from the same config, so a client can size
 * its batches before it uploads instead of discovering the limit from
 * `BULK_UPLOAD_FILES_EXCEEDED`.
 */

import 'graphile-build';

import { context as grafastContext, lambda, object } from 'grafast';
import type { GraphileConfig } from 'graphile-config';
import { withRequestPgClient } from 'graphile-plugin-utils';

import { loadAllStorageModules, resolveStorageConfigFromCodec } from './storage-module-cache';

export function createBulkLimitPlugin(): GraphileConfig.Plugin {
  return {
    name: 'PresignedUrlBulkLimitPlugin',
    version: '0.1.0',
    description: 'Adds maxBulkFiles to bucket types tagged with @storageBuckets',

    schema: {
      hooks: {
        GraphQLObjectType_fields(fields, build, context) {
          const {
            scope: { pgCodec, isPgClassType },
          } = context as any;

          if (!isPgClassType || !pgCodec?.attributes) return fields;
          if (!(pgCodec.extensions as any)?.tags?.storageBuckets) return fields;

          const {
            graphql: { GraphQLInt, GraphQLNonNull },
          } = build;
          const capturedCodec = pgCodec;

          return build.extend(
            fields,
            {
              maxBulkFiles: context.fieldWithHooks(
                { fieldName: 'maxBulkFiles' } as any,
                {
                  description:
                    'The most files one bulk-upload call accepts for this bucket. ' +
                    'Batches larger than this are refused with BULK_UPLOAD_FILES_EXCEEDED.',
                  type: new GraphQLNonNull(GraphQLInt),
                  plan() {
                    const $combined = object({
                      withPgClient: (grafastContext() as any).get('withPgClient'),
                      pgSettings: (grafastContext() as any).get('pgSettings'),
                    });

                    return lambda($combined, async ({ withPgClient, pgSettings }: any) => {
                      const databaseId = await withRequestPgClient(withPgClient, pgSettings, async (pgClient) => {
                        const result = await pgClient.query({
                          text: 'SELECT jwt_private.current_database_id() AS id',
                        });
                        return (result.rows[0]?.id as string | undefined) ?? null;
                      });
                      if (!databaseId) throw new Error('DATABASE_NOT_FOUND');

                      // Storage config is read on the request lane through the claim-scoped

                      // function_resolution.storage_modules(): no role switch, no RLS bypass.
                      const allConfigs = await withRequestPgClient(withPgClient, pgSettings, (pgClient) =>
                        loadAllStorageModules(pgClient, databaseId),
                      );
                      const storageConfig = resolveStorageConfigFromCodec(capturedCodec, allConfigs);
                      if (!storageConfig) throw new Error('STORAGE_MODULE_NOT_FOUND');

                      return storageConfig.maxBulkFiles;
                    });
                  },
                },
              ),
            },
            'PresignedUrlBulkLimitPlugin adding maxBulkFiles field',
          );
        },
      },
    },
  };
}

export default createBulkLimitPlugin;
