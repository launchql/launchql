/**
 * downloadUrl Computed Field Plugin
 *
 * Adds a `downloadUrl` computed field to File types in the GraphQL schema.
 * For public files, returns the public URL prefix + key.
 * For private files, generates a presigned GET URL.
 *
 * Detection: Uses the `@storageFiles` smart tag on the codec (table).
 * The storage module generator in constructive-db sets this tag on the
 * generated files table via a smart comment:
 *   COMMENT ON TABLE files IS E'@storageFiles\nStorage files table';
 *
 * This is explicit and reliable — no duck-typing on column names.
 *
 * IMPORTANT: Uses Grafast plan() instead of traditional resolve().
 * In PostGraphile V5, Grafast's planning system does not invoke traditional
 * resolve functions on PG table type fields — it plans them as column
 * lookups. Since downloadUrl is a computed field (not a real column),
 * the plan() function is required for Grafast to execute the S3 signing.
 */

import 'graphile-build';

import { Logger } from '@pgpmjs/logger';
import { context as grafastContext, lambda, object } from 'grafast';
import type { GraphileConfig } from 'graphile-config';
import { withSystemLaneClient } from 'graphile-plugin-utils';
import { DOWNLOAD_URL_FIELD } from 'graphile-storage-registry';

import { resolveS3ForDatabase } from './physical-bucket';
import { withRequestPgClient } from './request-pg-client';
import { generatePresignedGetUrl } from './s3-signer';
import { loadAllStorageModules, resolveStorageConfigFromCodec, storedPhysicalName } from './storage-module-cache';
import type { PresignedUrlPluginOptions } from './types';

const log = new Logger('graphile-presigned-url:download-url');

/**
 * Creates the downloadUrl computed field plugin.
 *
 * This is a separate plugin from the main presigned URL plugin because it
 * uses the GraphQLObjectType_fields hook (low-level) rather than extendSchema.
 * The downloadUrl field needs to be added dynamically to whatever table is
 * the storage module's files table, which we discover at schema-build time
 * via the `@storageFiles` smart tag.
 */
export function createDownloadUrlPlugin(
  options: PresignedUrlPluginOptions,
): GraphileConfig.Plugin {

  return {
    name: 'PresignedUrlDownloadPlugin',
    version: '0.2.0',
    description: 'Adds downloadUrl computed field to File types tagged with @storageFiles',

    schema: {
      hooks: {
        GraphQLObjectType_fields(fields, build, context) {
          const {
            scope: { pgCodec, isPgClassType },
          } = context as any;

          // Only process PG class types (table row types)
          if (!isPgClassType || !pgCodec || !pgCodec.attributes) {
            return fields;
          }

          // Check for @storageFiles smart tag — set by the storage module generator
          const tags = (pgCodec.extensions as any)?.tags;
          if (!tags?.storageFiles) {
            return fields;
          }

          log.debug(`Adding downloadUrl field to type: ${pgCodec.name} (has @storageFiles tag)`);

          const {
            graphql: { GraphQLString },
          } = build;

          const capturedCodec = pgCodec;

          return build.extend(
            fields,
            {
              [DOWNLOAD_URL_FIELD]: context.fieldWithHooks(
                { fieldName: DOWNLOAD_URL_FIELD } as any,
                {
                  description:
                    'URL to download this file. For public files, returns the public URL. ' +
                    'For private files, returns a time-limited presigned URL.',
                  type: GraphQLString,
                  plan($parent: any) {
                    const $key = $parent.get('key');
                    const $isPublic = $parent.get('is_public');
                    const $filename = $parent.get('filename');
                    const $bucketId = $parent.get('bucket_id');

                    const $withPgClient = (grafastContext() as any).get('withPgClient');
                    const $pgSettings = (grafastContext() as any).get('pgSettings');

                    const $combined = object({
                      key: $key,
                      isPublic: $isPublic,
                      filename: $filename,
                      bucketId: $bucketId,
                      withPgClient: $withPgClient,
                      pgSettings: $pgSettings,
                    });

                    return lambda($combined, async ({ key, isPublic, filename, bucketId, withPgClient, pgSettings }: any) => {
                      if (!key) return null;

                      if (!withPgClient || !pgSettings) return null;

                      const databaseId = await withRequestPgClient(withPgClient, pgSettings, async (pgClient) => {
                        const dbResult = await pgClient.query({
                          text: `SELECT jwt_private.current_database_id() AS id`,
                        });
                        return (dbResult.rows[0]?.id as string | undefined) ?? null;
                      });
                      // Module registration is server config, not user data:
                      // resolve it in the system lane's bounded role.
                      const config = databaseId
                        ? resolveStorageConfigFromCodec(
                          capturedCodec,
                          await withSystemLaneClient(withPgClient, (pgClient) => loadAllStorageModules(pgClient, databaseId)),
                        )
                        : null;
                      const resolved = config && bucketId
                        ? await withRequestPgClient(withPgClient, pgSettings, async (pgClient) => {
                          // Look up the stored physical coordinate for scoped S3 resolution
                          const bucketResult = await pgClient.query({
                            text: `SELECT key, physical_name FROM ${config.bucketsQualifiedName} WHERE id = $1 LIMIT 1`,
                            values: [bucketId],
                          });
                          const row = bucketResult.rows[0] as { key: string; physical_name?: string | null } | undefined;
                          return row ? { config, physicalName: storedPhysicalName(row) } : null;
                        })
                        : null;
                      // No resolvable bucket row, or no physical bucket was ever
                      // provisioned: no object can exist.
                      if (!resolved || resolved.physicalName === null) return null;

                      const s3ForDb = resolveS3ForDatabase(options, resolved.config, resolved.physicalName);
                      if (isPublic && s3ForDb.publicUrlPrefix) {
                        return `${s3ForDb.publicUrlPrefix}/${s3ForDb.bucket}/${key}`;
                      }

                      return generatePresignedGetUrl(
                        s3ForDb,
                        key,
                        resolved.config.downloadUrlExpirySeconds,
                        filename || undefined,
                      );
                    });
                  },
                },
              ),
            },
            'PresignedUrlDownloadPlugin adding downloadUrl field',
          );
        },
      },
    },
  };
}

export default createDownloadUrlPlugin;
