/**
 * Presigned URL Plugin for PostGraphile v5
 *
 * Provides per-table S3 storage middleware for PostGraphile v5:
 * - Upload fields on @storageBuckets types (requestUploadUrl, requestBulkUploadUrls)
 * - Delete middleware on @storageFiles tables (S3 cleanup on delete)
 * - downloadUrl computed field on @storageFiles types
 *
 * @example
 * ```typescript
 * import { PresignedUrlPreset } from 'graphile-presigned-url-plugin';
 * const preset = {
 *   extends: [
 *     PresignedUrlPreset({
 *       credentials: () => ({
 *         accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
 *         secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
 *       }),
 *     }),
 *   ],
 * };
 * ```
 */

export {
  CONFIRM_PREFIX_BYTES,
  confirmUploadedBytes,
  type ConfirmUploadInput,
  type ConfirmUploadVerdict,
} from './confirm-upload';
export { validateCustomKey } from './custom-key';
export type { ResolvedBucketCoordinate } from './default-bucket';
export { resolveDefaultBucket } from './default-bucket';
export { createDownloadUrlPlugin } from './download-url-field';
export type { FileRefFieldBinding } from './file-ref-registry';
export { clearFileRefFieldCache, FileRefFieldNotRegisteredError, getFileRefFieldBinding } from './file-ref-registry';
export {
  assertUploadAllowedByBucket,
  buildFileProjection,
  type FileProjection,
  finalizeStagedUpload,
  type ManagedUploadTarget,
  resolveManagedUploadTarget,
} from './managed-upload';
export {
  assertBucketReconciled,
  resolveS3ForDatabase,
  StorageBucketNotReconciledError,
  StorageConnectionNotConfiguredError,
  StorageConnectionOverrideError,
} from './physical-bucket';
export { createPresignedUrlPlugin,PresignedUrlPlugin } from './plugin';
export { PresignedUrlPreset } from './preset';
export { type WithPgClient, withRequestPgClient } from './request-pg-client';
export { describeS3Failure, s3FailureError } from './s3-failure';
export { copyS3Object, deleteS3Object, generatePresignedGetUrl, generatePresignedPutUrl, headObject, readObjectPrefix } from './s3-signer';
export { clearBucketCache, clearStorageModuleCache, getBucketConfig, loadAllStorageModules,resolveStorageConfigFromCodec, resolveStorageModuleByFileId } from './storage-module-cache';
export type {
  BucketConfig,
  PresignedUrlPluginOptions,
  RequestUploadUrlInput,
  RequestUploadUrlPayload,
  S3Config,
  StorageCredentials,
  StorageModuleConfig,
} from './types';
