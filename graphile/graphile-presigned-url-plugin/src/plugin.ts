/**
 * Per-Table Storage Middleware Plugin for PostGraphile v5
 *
 * Hooks into PostGraphile's auto-generated CRUD mutations to add S3 operations:
 *
 * 1. File upload mutations — adds `upload<FileType>(input: {...})` mutations
 *    on root Mutation for each @storageFiles/@storageBuckets pair. These combine
 *    bucket resolution + file INSERT + presigned URL generation in one step.
 *    E.g., `uploadAppFile(input: { bucketKey: "public", contentHash: "...", ... })`
 *    Pairs are discovered from the registry's FK relations (see
 *    graphile-storage-registry) — table naming carries no meaning here.
 *
 * 2. Delete middleware — wraps `delete*` mutations on `@storageFiles`-tagged tables
 *    with S3 object cleanup (sync + async GC fallback via AFTER DELETE trigger).
 *
 * 3. downloadUrl — handled by download-url-field.ts (separate plugin).
 *
 * Scope resolution uses the codec's schema/table name matched against
 * cached storage module configs.
 */

import 'graphile-build';

import { Logger } from '@pgpmjs/logger';
import { access, context as grafastContext, lambda, object } from 'grafast';
import type { GraphileConfig } from 'graphile-config';
import { withRequestPgClient } from 'graphile-plugin-utils';
import { discoverStoragePlanes, uploadSurfaceNames } from 'graphile-storage-registry';
import { checkTypeAgreement } from 'mime-bytes';

import { validateCustomKey } from './custom-key';
import { resolveDefaultBucket } from './default-bucket';
import { isLiveFileRow, statusSelectFragment } from './file-lifecycle';
import { buildFileProjection, type FileProjection } from './managed-upload';
import { assertBucketReconciled, resolveS3ForDatabase } from './physical-bucket';
import { deleteS3Object,generatePresignedPutUrl } from './s3-signer';
import { recordManagedFile } from './storage-file-recorder';
import { getBucketConfig, loadAllStorageModules, resolveStorageConfigFromCodec, storedPhysicalName } from './storage-module-cache';
import type { BucketConfig,PresignedUrlPluginOptions, S3Config, StorageModuleConfig } from './types';

const log = new Logger('graphile-presigned-url:plugin');

// --- Protocol-level constants (not configurable) ---

const MAX_CONTENT_HASH_LENGTH = 128;
const MAX_CONTENT_TYPE_LENGTH = 255;
const SHA256_HEX_REGEX = /^[a-f0-9]{64}$/;

// --- Helpers ---

function isValidSha256(hash: string): boolean {
  return SHA256_HEX_REGEX.test(hash);
}

function buildS3Key(contentHash: string): string {
  return contentHash;
}

function derivePathFromKey(key: string): string | null {
  const lastSlash = key.lastIndexOf('/');
  if (lastSlash <= 0) return null;
  const dir = key.substring(0, lastSlash);
  return dir.replace(/\//g, '.');
}

async function resolveDatabaseId(pgClient: any): Promise<string | null> {
  const result = await pgClient.query({
    text: `SELECT jwt_private.current_database_id() AS id`,
  });
  return result.rows[0]?.id ?? null;
}

/**
 * Resolve the bucket an upload mutation writes into.
 *
 * A named `bucketKey` is the caller's override and is read directly, as before.
 * An omitted one asks the database for the tenant's reserved default tag for the
 * requested access, so a missing or ambiguous default raises in SQL rather than
 * falling back to a server-global bucket name here.
 */
async function resolveUploadBucket(
  pgClient: any,
  storageConfig: StorageModuleConfig,
  databaseId: string,
  bucketKey: string | null,
  ownerId: string | null,
  isPublic: boolean,
): Promise<BucketConfig | null> {
  if (bucketKey) {
    return getBucketConfig(pgClient, storageConfig, databaseId, bucketKey, ownerId || undefined);
  }

  const coordinate = await resolveDefaultBucket(
    pgClient,
    databaseId,
    storageConfig.scope,
    ownerId,
    isPublic,
    null,
  );
  return getBucketConfig(pgClient, storageConfig, databaseId, coordinate.resolvedKey, ownerId || undefined);
}

// --- Plugin factory ---

export function createPresignedUrlPlugin(
  options: PresignedUrlPluginOptions,
): GraphileConfig.Plugin {

  return {
    name: 'PresignedUrlPlugin',
    version: '1.0.0',
    description: 'Per-table S3 storage middleware: upload fields on @storageBuckets, delete middleware on @storageFiles',

    after: ['PgAttributesPlugin', 'PgMutationCreatePlugin', 'PgMutationUpdateDeletePlugin'],

    schema: {
      hooks: {
        /**
         * Add file upload mutations (uploadAppFile, uploadDataRoomFile, etc.) on root Mutation.
         */
        GraphQLObjectType_fields(fields, build, context) {
          const {
            scope: { isRootMutation },
          } = context as any;

          if (!isRootMutation) return fields;

          const {
            graphql: {
              GraphQLString,
              GraphQLNonNull,
              GraphQLInt,
              GraphQLBoolean,
              GraphQLObjectType,
              GraphQLInputObjectType,
              GraphQLList,
              isOutputType,
            },
          } = build;

          // The projection document is jsonb-shaped. PostGraphile registers a JSON
          // scalar whenever the schema has a jsonb column, which any storage-equipped
          // database does; if it is absent the payload simply omits the field rather
          // than failing schema build over a field nothing can have asked for yet.
          const jsonNamedType = build.getTypeByName('JSON');
          const jsonType = jsonNamedType && isOutputType(jsonNamedType) ? jsonNamedType : null;
          if (!jsonType) {
            log.warn('No JSON scalar in this schema; upload payloads will omit the `file` projection');
          }

          // Each @storageFiles table is paired with its @storageBuckets table
          // through the registry's actual FK relation; a tagged table that cannot
          // be paired is a provisioning bug and throws at schema build.
          const planes = discoverStoragePlanes((build.input as any).pgRegistry as any);

          if (planes.length === 0) return fields;

          const newFields: Record<string, any> = {};

          // --- File upload mutations (uploadAppFile, uploadDataRoomFile, etc.) ---
          for (const plane of planes) {
            const filesCodec = plane.filesCodec as any;
            const matchingBucketCodec = plane.bucketsCodec as any;
            const names = uploadSurfaceNames(build.inflection as any, plane.filesCodec);
            const { filesTypeName, uploadMutation: mutationName } = names;

            const hasOwnerId = plane.hasOwnerId;

            const ownerIdGqlType = hasOwnerId
              ? (build as any).getGraphQLTypeByPgCodec(matchingBucketCodec.attributes.owner_id.codec, 'input')
              : null;

            const InputType = new GraphQLInputObjectType({
              name: names.uploadInputType,
              fields: {
                bucketKey: { type: GraphQLString, description: 'Bucket key (e.g., "public", "private"). Omit to use the database\'s default bucket for the requested access.' },
                isPublic: { type: GraphQLBoolean, description: 'Which default bucket to resolve when bucketKey is omitted: the public one (true) or the private one (default false). Ignored when bucketKey is given.' },
                ...(hasOwnerId
                  ? { ownerId: { type: new GraphQLNonNull(ownerIdGqlType || GraphQLString), description: 'Owner entity ID (required for entity-scoped buckets)' } }
                  : {}),
                contentHash: { type: new GraphQLNonNull(GraphQLString), description: 'SHA-256 content hash (hex-encoded, 64 chars)' },
                contentType: { type: new GraphQLNonNull(GraphQLString), description: 'MIME type of the file' },
                size: { type: new GraphQLNonNull(GraphQLInt), description: 'File size in bytes' },
                filename: { type: GraphQLString, description: 'Original filename (optional)' },
                key: { type: GraphQLString, description: 'Custom S3 key (only when bucket has allow_custom_keys=true)' },
              },
            });

            const PayloadType = new GraphQLObjectType({
              name: names.uploadPayloadType,
              fields: {
                uploadUrl: { type: GraphQLString, description: 'Presigned PUT URL (null if deduplicated)' },
                fileId: { type: new GraphQLNonNull(GraphQLString), description: 'The file ID (UUID)' },
                key: { type: new GraphQLNonNull(GraphQLString), description: 'The S3 object key' },
                deduplicated: { type: new GraphQLNonNull(GraphQLBoolean), description: 'Whether this file was deduplicated (content already exists)' },
                expiresAt: { type: GraphQLString, description: 'Presigned URL expiry time (null if deduplicated)' },
                previousVersionId: { type: GraphQLString, description: 'ID of the previous version (when using custom keys)' },
                ...(jsonType
                  ? {
                    file: {
                      type: jsonType,
                      description:
                          'The projection document for the created file: {id, key, bucket_id, mime, size, filename, url?}. ' +
                          'Store this verbatim in an image/upload column — its `id` is what keeps the object from being ' +
                          'garbage collected while the column still references it.',
                    },
                  }
                  : {}),
              },
            });

            const capturedFilesCodec = filesCodec;

            log.debug(`Adding file upload mutation "${mutationName}" for ${filesTypeName} (entity-scoped=${hasOwnerId})`);

            newFields[mutationName] = context.fieldWithHooks(
                { fieldName: mutationName } as any,
                {
                  description: `Upload a file: resolves the bucket by key, creates the file row, and returns a presigned PUT URL.`,
                  type: PayloadType,
                  args: {
                    input: { type: new GraphQLNonNull(InputType) },
                  },
                  plan(_$mutation: any, fieldArgs: any) {
                    const $input = fieldArgs.getRaw('input');
                    const $bucketKey = access($input, 'bucketKey');
                    const $isPublic = access($input, 'isPublic');
                    const $contentHash = access($input, 'contentHash');
                    const $contentType = access($input, 'contentType');
                    const $size = access($input, 'size');
                    const $filename = access($input, 'filename');
                    const $customKey = access($input, 'key');
                    const $ownerId = hasOwnerId ? access($input, 'ownerId') : lambda(null, (): null => null);
                    const $withPgClient = (grafastContext() as any).get('withPgClient');
                    const $pgSettings = (grafastContext() as any).get('pgSettings');

                    const $combined = object({
                      bucketKey: $bucketKey,
                      isPublic: $isPublic,
                      ownerId: $ownerId,
                      contentHash: $contentHash,
                      contentType: $contentType,
                      size: $size,
                      filename: $filename,
                      customKey: $customKey,
                      withPgClient: $withPgClient,
                      pgSettings: $pgSettings,
                    });

                    return lambda($combined, async (vals: any) => {
                      // Request-lane reads/writes run under the request role's pgSettings
                      // inside an explicit transaction so the jwt claims stay applied
                      // across every statement (see withRequestPgClient).
                      const databaseId = await withRequestPgClient(vals.withPgClient, vals.pgSettings, (pgClient) =>
                        resolveDatabaseId(pgClient),
                      );
                      if (!databaseId) throw new Error('DATABASE_NOT_FOUND');

                      // Storage config is read on the request lane through the claim-scoped

                      // function_resolution.storage_modules(): no role switch, no RLS bypass.
                      const allConfigs = await withRequestPgClient(vals.withPgClient, vals.pgSettings, (pgClient) =>
                        loadAllStorageModules(pgClient, databaseId),
                      );
                      const storageConfig = resolveStorageConfigFromCodec(capturedFilesCodec, allConfigs);
                      if (!storageConfig) throw new Error('STORAGE_MODULE_NOT_FOUND');

                      // Bucket resolution + read under the request role (RLS-gated visibility).
                      const bucket = await withRequestPgClient(vals.withPgClient, vals.pgSettings, (pgClient) =>
                        resolveUploadBucket(
                          pgClient, storageConfig, databaseId,
                          vals.bucketKey ?? null, vals.ownerId ?? null, vals.isPublic === true,
                        ),
                      );
                      if (!bucket) throw new Error('BUCKET_NOT_FOUND');

                      // The reconciler records the coordinate; consumers never
                      // recompute it from the logical bucket row.
                      const physicalName = assertBucketReconciled(bucket, databaseId);
                      const s3ForDb = resolveS3ForDatabase(options, storageConfig, physicalName);

                      // File row INSERT under the request role (RLS enforced).
                      return withRequestPgClient(vals.withPgClient, vals.pgSettings, (txClient) =>
                        processSingleFile(options, txClient, storageConfig, databaseId, bucket, s3ForDb, {
                          contentHash: vals.contentHash,
                          contentType: vals.contentType,
                          size: vals.size,
                          filename: vals.filename,
                          key: vals.customKey,
                        }),
                      );
                    });
                  },
                },
            );

            // --- Bulk file upload mutation ---
            const BulkFileInputType = new GraphQLInputObjectType({
              name: names.bulkUploadFileInputType,
              fields: {
                contentHash: { type: new GraphQLNonNull(GraphQLString), description: 'SHA-256 content hash (hex-encoded, 64 chars)' },
                contentType: { type: new GraphQLNonNull(GraphQLString), description: 'MIME type of the file' },
                size: { type: new GraphQLNonNull(GraphQLInt), description: 'File size in bytes' },
                filename: { type: GraphQLString, description: 'Original filename (optional)' },
                key: { type: GraphQLString, description: 'Custom S3 key (only when bucket has allow_custom_keys=true)' },
              },
            });

            const BulkFilePayloadType = new GraphQLObjectType({
              name: names.bulkUploadFilePayloadType,
              fields: {
                uploadUrl: { type: GraphQLString },
                fileId: { type: new GraphQLNonNull(GraphQLString) },
                key: { type: new GraphQLNonNull(GraphQLString) },
                deduplicated: { type: new GraphQLNonNull(GraphQLBoolean) },
                expiresAt: { type: GraphQLString },
                previousVersionId: { type: GraphQLString },
                ...(jsonType ? { file: { type: jsonType, description: 'The projection document for the created file.' } } : {}),
              },
            });

            const BulkInputType = new GraphQLInputObjectType({
              name: names.bulkUploadInputType,
              fields: {
                bucketKey: { type: GraphQLString, description: 'Bucket key (e.g., "public", "private"). Omit to use the database\'s default bucket for the requested access.' },
                isPublic: { type: GraphQLBoolean, description: 'Which default bucket to resolve when bucketKey is omitted. Ignored when bucketKey is given.' },
                ...(hasOwnerId
                  ? { ownerId: { type: new GraphQLNonNull(ownerIdGqlType || GraphQLString), description: 'Owner entity ID (required for entity-scoped buckets)' } }
                  : {}),
                files: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(BulkFileInputType))), description: 'Array of files to upload' },
              },
            });

            const BulkPayloadType = new GraphQLObjectType({
              name: names.bulkUploadPayloadType,
              fields: {
                files: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(BulkFilePayloadType))) },
              },
            });

            const bulkMutationName = names.bulkUploadMutation;
            log.debug(`Adding bulk file upload mutation "${bulkMutationName}" for ${filesTypeName}`);

            newFields[bulkMutationName] = context.fieldWithHooks(
                { fieldName: bulkMutationName } as any,
                {
                  description: `Upload multiple files: resolves the bucket by key, creates file rows, and returns presigned PUT URLs for each. Accepts at most the bucket's \`maxBulkFiles\` files per call.`,
                  type: BulkPayloadType,
                  args: {
                    input: { type: new GraphQLNonNull(BulkInputType) },
                  },
                  plan(_$mutation: any, fieldArgs: any) {
                    const $input = fieldArgs.getRaw('input');
                    const $bucketKey = access($input, 'bucketKey');
                    const $isPublic = access($input, 'isPublic');
                    const $ownerId = hasOwnerId ? access($input, 'ownerId') : lambda(null, (): null => null);
                    const $files = access($input, 'files');
                    const $withPgClient = (grafastContext() as any).get('withPgClient');
                    const $pgSettings = (grafastContext() as any).get('pgSettings');

                    const $combined = object({
                      bucketKey: $bucketKey,
                      isPublic: $isPublic,
                      ownerId: $ownerId,
                      files: $files,
                      withPgClient: $withPgClient,
                      pgSettings: $pgSettings,
                    });

                    return lambda($combined, async (vals: any) => {
                      // Request-lane reads/writes run under the request role's pgSettings
                      // inside an explicit transaction so the jwt claims stay applied
                      // across every statement (see withRequestPgClient).
                      const databaseId = await withRequestPgClient(vals.withPgClient, vals.pgSettings, (pgClient) =>
                        resolveDatabaseId(pgClient),
                      );
                      if (!databaseId) throw new Error('DATABASE_NOT_FOUND');

                      // Storage config is read on the request lane through the claim-scoped

                      // function_resolution.storage_modules(): no role switch, no RLS bypass.
                      const allConfigs = await withRequestPgClient(vals.withPgClient, vals.pgSettings, (pgClient) =>
                        loadAllStorageModules(pgClient, databaseId),
                      );
                      const storageConfig = resolveStorageConfigFromCodec(capturedFilesCodec, allConfigs);
                      if (!storageConfig) throw new Error('STORAGE_MODULE_NOT_FOUND');

                      // Bucket resolution + read under the request role (RLS-gated visibility).
                      const bucket = await withRequestPgClient(vals.withPgClient, vals.pgSettings, (pgClient) =>
                        resolveUploadBucket(
                          pgClient, storageConfig, databaseId,
                          vals.bucketKey ?? null, vals.ownerId ?? null, vals.isPublic === true,
                        ),
                      );
                      if (!bucket) throw new Error('BUCKET_NOT_FOUND');

                      // Enforce bulk upload limits
                      const filesArray = vals.files as any[];
                      if (filesArray.length > storageConfig.maxBulkFiles) {
                        throw new Error(
                          `BULK_UPLOAD_FILES_EXCEEDED: ${filesArray.length} files exceeds maximum of ${storageConfig.maxBulkFiles} per batch`,
                        );
                      }
                      const totalSize = filesArray.reduce((sum: number, f: any) => sum + (f.size || 0), 0);
                      if (totalSize > storageConfig.maxBulkTotalSize) {
                        throw new Error(
                          `BULK_UPLOAD_SIZE_EXCEEDED: ${totalSize} bytes exceeds maximum of ${storageConfig.maxBulkTotalSize} bytes per batch`,
                        );
                      }

                      // The reconciler records the coordinate; consumers never
                      // recompute it from the logical bucket row.
                      const physicalName = assertBucketReconciled(bucket, databaseId);
                      const s3ForDb = resolveS3ForDatabase(options, storageConfig, physicalName);

                      // File row INSERTs under the request role (RLS enforced).
                      return withRequestPgClient(vals.withPgClient, vals.pgSettings, async (txClient) => {
                        const results = [];
                        for (const file of filesArray) {
                          results.push(
                            await processSingleFile(options, txClient, storageConfig, databaseId, bucket, s3ForDb, {
                              contentHash: file.contentHash,
                              contentType: file.contentType,
                              size: file.size,
                              filename: file.filename,
                              key: file.key,
                            }),
                          );
                        }
                        return { files: results };
                      });
                    });
                  },
                },
            );
          }

          return build.extend(
            fields,
            newFields,
            'PresignedUrlPlugin adding file upload mutations',
          );
        },

        /**
         * Wrap delete* mutations on @storageFiles-tagged tables with S3 cleanup.
         *
         * Pattern: identical to graphile-bucket-provisioner-plugin's create/update hooks.
         * 1. Read the file row BEFORE delete (need key + bucket_id for S3 cleanup)
         * 2. Call PostGraphile's generated delete (RLS enforced)
         * 3. If delete succeeded, check refcount and attempt sync S3 delete
         * 4. AFTER DELETE trigger (constructive-db) enqueues async GC job as fallback
         */
        GraphQLObjectType_fields_field(field: any, build: any, context: any) {
          const {
            scope: { isRootMutation, fieldName, pgCodec },
          } = context;

          if (!isRootMutation || !pgCodec || !pgCodec.attributes) {
            return field;
          }

          const tags = pgCodec.extensions?.tags;
          if (!tags?.storageFiles) {
            return field;
          }

          if (!fieldName.startsWith('delete')) {
            return field;
          }

          log.debug(`Wrapping delete mutation "${fieldName}" with S3 cleanup (codec: ${pgCodec.name})`);

          const defaultResolver = (obj: any) => obj[fieldName];
          const { resolve: oldResolve = defaultResolver, ...rest } = field;
          const capturedCodec = pgCodec;

          return {
            ...rest,
            async resolve(source: any, args: any, graphqlContext: any, info: any) {
              // Extract the file ID from the mutation input
              const inputKey = Object.keys(args.input || {}).find(
                (k) => k !== 'clientMutationId',
              );
              const fileInput = inputKey ? args.input[inputKey] : null;

              let fileRow: { key: string; bucket_id: string } | null = null;

              if (fileInput) {
                // Read the file row BEFORE delete to get the S3 key + bucket_id
                const withPgClient = graphqlContext.withPgClient;
                const pgSettings = graphqlContext.pgSettings;

                if (withPgClient) {
                  try {
                    const databaseId = await withRequestPgClient(withPgClient, pgSettings, (pgClient) => resolveDatabaseId(pgClient));
                    // Storage config is read on the request lane through the claim-scoped
                    // function_resolution.storage_modules(): no role switch, no RLS bypass.
                    const allConfigs = databaseId
                      ? await withRequestPgClient(withPgClient, pgSettings, (pgClient) => loadAllStorageModules(pgClient, databaseId))
                      : [];
                    const storageConfig = resolveStorageConfigFromCodec(capturedCodec, allConfigs);

                    if (storageConfig) {
                      await withRequestPgClient(withPgClient, pgSettings, async (pgClient) => {
                        // Read the file row (RLS enforced)
                        const result = await pgClient.query({
                          text: `SELECT key, bucket_id FROM ${storageConfig.filesQualifiedName} WHERE id = $1 LIMIT 1`,
                          values: [fileInput],
                        });
                        if (result.rows.length > 0) {
                          fileRow = result.rows[0] as { key: string; bucket_id: string };
                        }
                      });
                    }
                  } catch (err: any) {
                    log.warn(`Pre-delete file lookup failed: ${err.message}`);
                  }
                }
              }

              // Call PostGraphile's generated delete (RLS enforced)
              const result = await oldResolve(source, args, graphqlContext, info);

              // Attempt sync S3 cleanup if we have the file row
              if (fileRow) {
                const withPgClient = graphqlContext.withPgClient;
                const pgSettings = graphqlContext.pgSettings;

                if (withPgClient) {
                  try {
                    const databaseId = await withRequestPgClient(withPgClient, pgSettings, (pgClient) => resolveDatabaseId(pgClient));
                    // Storage config is read on the request lane through the claim-scoped
                    // function_resolution.storage_modules(): no role switch, no RLS bypass.
                    const allConfigs = databaseId
                      ? await withRequestPgClient(withPgClient, pgSettings, (pgClient) => loadAllStorageModules(pgClient, databaseId))
                      : [];
                    const storageConfig = resolveStorageConfigFromCodec(capturedCodec, allConfigs);

                    if (storageConfig) await withRequestPgClient(withPgClient, pgSettings, async (pgClient) => {
                      // Check refcount: any other file with the same key in this bucket?
                      const refResult = await pgClient.query({
                        text: `SELECT COUNT(*)::int AS ref_count FROM ${storageConfig.filesQualifiedName} WHERE key = $1 AND bucket_id = $2`,
                        values: [fileRow!.key, fileRow!.bucket_id],
                      });
                      const refCount = (refResult.rows[0]?.ref_count as number | undefined) ?? 0;

                      if (refCount > 0) {
                        log.info(`File deleted from DB; S3 key ${fileRow!.key} still referenced by ${refCount} file(s)`);
                        return;
                      }

                      // No other references — attempt sync S3 delete.
                      // Read the stored physical coordinate; the object lives in the
                      // recorded bucket, never a recomputed prefix name.
                      const bucketResult = await pgClient.query({
                        text: `SELECT key, physical_name FROM ${storageConfig.bucketsQualifiedName} WHERE id = $1 LIMIT 1`,
                        values: [fileRow!.bucket_id],
                      });
                      const bucketRow = bucketResult.rows[0] as { key: string; physical_name?: string | null } | undefined;
                      if (!bucketRow) {
                        log.warn(`Bucket not found for bucket_id=${fileRow!.bucket_id}; skipping S3 delete`);
                        return;
                      }
                      const physicalName = storedPhysicalName(bucketRow);
                      if (physicalName === null) {
                        // No physical bucket was ever provisioned — there is no object to delete.
                        log.warn(`Bucket ${fileRow!.bucket_id} has no physical_name; skipping S3 delete`);
                        return;
                      }
                      const s3ForDb = resolveS3ForDatabase(options, storageConfig, physicalName);
                      await deleteS3Object(s3ForDb, fileRow!.key);
                      log.info(`Sync S3 delete succeeded for key=${fileRow!.key}`);
                    });
                  } catch (err: any) {
                    // Sync S3 delete failed — the AFTER DELETE trigger has enqueued an async GC job
                    log.warn(`Sync S3 delete failed for key=${fileRow.key}; async GC job will retry: ${err.message}`);
                  }
                }
              }

              return result;
            },
          };
        },
      },
    },
  };
}

// --- Shared upload logic ---

export async function processSingleFile(
  options: PresignedUrlPluginOptions,
  txClient: any,
  storageConfig: StorageModuleConfig,
  databaseId: string,
  bucket: BucketConfig,
  s3ForDb: S3Config,
  input: any,
) {
  const { contentHash, contentType, size, filename, key: customKey } = input;

  if (!contentHash || typeof contentHash !== 'string' || contentHash.length > MAX_CONTENT_HASH_LENGTH) {
    throw new Error('INVALID_CONTENT_HASH');
  }
  if (!isValidSha256(contentHash)) {
    throw new Error('INVALID_CONTENT_HASH_FORMAT: must be a 64-char lowercase hex SHA-256');
  }
  if (!contentType || typeof contentType !== 'string' || contentType.length > MAX_CONTENT_TYPE_LENGTH) {
    throw new Error('INVALID_CONTENT_TYPE');
  }
  if (typeof size !== 'number' || size <= 0 || size > storageConfig.defaultMaxFileSize) {
    throw new Error(`INVALID_FILE_SIZE: must be between 1 and ${storageConfig.defaultMaxFileSize} bytes`);
  }
  if (filename !== undefined && filename !== null) {
    if (typeof filename !== 'string' || filename.length > storageConfig.maxFilenameLength) {
      throw new Error('INVALID_FILENAME');
    }
  }

  // The bytes are not here to be examined — the client PUTs them straight to S3 —
  // so this checks the two claims that *are* here against each other. It is the
  // cheap half of the rule: an upload declaring `image/jpeg` under the name
  // `payload.html` is refused before a row exists, without reading a byte. The
  // bytes themselves are checked on confirmation, before the row leaves
  // `requested`.
  const agreement = checkTypeAgreement({ filename, declaredMime: contentType });
  if (!agreement.ok) {
    throw new Error(`UPLOAD_TYPE_MISMATCH: ${agreement.violation.message}`);
  }

  // Validate content type against bucket's allowed_mime_types
  if (bucket.allowed_mime_types && bucket.allowed_mime_types.length > 0) {
    const allowed = bucket.allowed_mime_types as string[];
    const isAllowed = allowed.some((pattern: string) => {
      if (pattern === '*/*') return true;
      if (pattern.endsWith('/*')) {
        const prefix = pattern.slice(0, -1);
        return contentType.startsWith(prefix);
      }
      return contentType === pattern;
    });
    if (!isAllowed) {
      throw new Error(`CONTENT_TYPE_NOT_ALLOWED: ${contentType} not in bucket allowed types`);
    }
  }

  // Validate size against bucket's max_file_size
  if (bucket.max_file_size && size > bucket.max_file_size) {
    throw new Error(`FILE_TOO_LARGE: exceeds bucket max of ${bucket.max_file_size} bytes`);
  }

  // The projection document the caller stores in an image/upload column. Built
  // from the same values the files row carries, so the column and the row cannot
  // disagree, and it names the files row by id — which is what stops GC from
  // collecting an object a document still points at.
  const projectFile = (fileId: string, key: string): FileProjection =>
    buildFileProjection(
      { id: fileId, key, bucketId: bucket.id, mime: contentType, size, filename },
      bucket,
      s3ForDb,
    );

  // Determine S3 key
  let s3Key: string;
  let isCustomKey = false;
  if (customKey) {
    if (!bucket.allow_custom_keys) {
      throw new Error('CUSTOM_KEY_NOT_ALLOWED: bucket does not allow custom keys');
    }
    const keyError = validateCustomKey(customKey);
    if (keyError) {
      throw new Error(keyError);
    }
    s3Key = customKey;
    isCustomKey = true;
  } else {
    s3Key = buildS3Key(contentHash);
  }

  // Dedup / versioning check
  let previousVersionId: string | null = null;

  // A row whose bytes never landed must not be reported as a dedup hit: the
  // caller would store a reference to an object that is not in S3. Such a row is
  // dropped instead, and the upload proceeds as a fresh one below — the insert is
  // what enqueues the confirm-upload job, so restarting the lifecycle is the only
  // way the retry can ever leave `requested`. Dropping it is also what keeps the
  // retry insertable at all for a content-addressed key, where the key *is* the
  // hash and a second row would collide on (bucket_id, key). The GC job the
  // delete enqueues re-takes the reference count when it runs (≥5s later), by
  // which point the replacement row exists, so it no-ops.
  const statusColumn = statusSelectFragment(storageConfig);
  let staleFileId: string | null = null;

  if (isCustomKey) {
    const existingResult = await txClient.query({
      text: `SELECT id, content_hash${statusColumn}
       FROM ${storageConfig.filesQualifiedName}
       WHERE key = $1
         AND bucket_id = $2
       ORDER BY created_at DESC
       LIMIT 1`,
      values: [s3Key, bucket.id],
    });

    if (existingResult.rows.length > 0) {
      const existing = existingResult.rows[0];
      if (existing.content_hash === contentHash) {
        if (await isLiveFileRow(storageConfig, s3ForDb, { key: s3Key, status: existing.status })) {
          log.info(`Dedup hit (custom key): file ${existing.id} for key ${s3Key}`);
          return {
            uploadUrl: null as string | null,
            fileId: existing.id as string,
            key: s3Key,
            deduplicated: true,
            expiresAt: null as string | null,
            previousVersionId: null as string | null,
            file: projectFile(existing.id as string, s3Key),
          };
        }
        staleFileId = existing.id as string;
        log.info(`Restarting upload of key ${s3Key}: file ${staleFileId} has no bytes behind it`);
      } else if (storageConfig.hasVersioning) {
        previousVersionId = existing.id;
        log.info(`Versioning: new version of key ${s3Key}, previous=${previousVersionId}`);
      } else if (storageConfig.hasContentHash) {
        // GC of the deleted row counts references by its content hash, which the
        // replacement does not share, so it would delete the object at this key
        // after the new bytes land.
        throw new Error(
          `STORAGE_REPLACE_UNSUPPORTED: key ${s3Key} already holds file ${existing.id}; ` +
            'a content-addressed module needs versioning to replace a custom key'
        );
      } else {
        // Without versioning a key names one row: the new bytes replace the old
        // row in this transaction, and the PUT overwrites the object at the key.
        // GC of the old row counts references by key, so the replacement keeps it.
        staleFileId = existing.id as string;
        log.info(`Replacing key ${s3Key}: file ${staleFileId} is superseded (module has no versioning)`);
      }
    }
  } else {
    const dedupResult = await txClient.query({
      text: `SELECT id, key${statusColumn}
       FROM ${storageConfig.filesQualifiedName}
       WHERE content_hash = $1
         AND bucket_id = $2
       LIMIT 1`,
      values: [contentHash, bucket.id],
    });

    if (dedupResult.rows.length > 0) {
      const existingFile = dedupResult.rows[0];
      // A custom-key row can carry this hash, so the bytes are at the row's own key.
      const existingKey = existingFile.key as string;
      if (await isLiveFileRow(storageConfig, s3ForDb, { key: existingKey, status: existingFile.status })) {
        log.info(`Dedup hit: file ${existingFile.id} for hash ${contentHash}`);

        return {
          uploadUrl: null as string | null,
          fileId: existingFile.id as string,
          key: existingKey,
          deduplicated: true,
          expiresAt: null as string | null,
          previousVersionId: null as string | null,
          file: projectFile(existingFile.id as string, existingKey),
        };
      }
      staleFileId = existingFile.id as string;
      log.info(`Restarting upload of hash ${contentHash}: file ${staleFileId} has no bytes behind it`);
    }
  }

  if (staleFileId !== null) {
    // The DELETE runs under the request role, so RLS decides whether this caller
    // may drop the row. A row the caller can see but not delete stays, and the
    // upload fails here rather than colliding on (bucket_id, key) below.
    const deleted = await txClient.query({
      text: `DELETE FROM ${storageConfig.filesQualifiedName} WHERE id = $1 RETURNING id`,
      values: [staleFileId],
    });
    if (deleted.rows.length === 0) {
      throw new Error(`FILE_NOT_REPLACEABLE: file ${staleFileId} at key ${s3Key} cannot be replaced by this caller`);
    }
  }

  // Auto-derive ltree path from custom key directory (only when has_path_shares)
  const derivedPath = isCustomKey && storageConfig.hasPathShares ? derivePathFromKey(s3Key) : null;

  const fileId = await recordManagedFile(txClient, storageConfig, {
    bucketId: bucket.id,
    key: s3Key,
    contentHash,
    mimeType: contentType,
    size,
    filename: filename || null,
    previousVersionId,
    path: derivedPath,
  });

  // Generate presigned PUT URL
  const uploadUrl = await generatePresignedPutUrl(
    s3ForDb,
    s3Key,
    contentType,
    size,
    storageConfig.uploadUrlExpirySeconds,
  );

  const expiresAt = new Date(Date.now() + storageConfig.uploadUrlExpirySeconds * 1000).toISOString();

  return {
    uploadUrl,
    fileId,
    key: s3Key,
    deduplicated: false,
    expiresAt,
    previousVersionId,
    file: projectFile(fileId, s3Key),
  };
}

export const PresignedUrlPlugin = createPresignedUrlPlugin;
export default PresignedUrlPlugin;
