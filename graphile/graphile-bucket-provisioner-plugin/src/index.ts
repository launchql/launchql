/**
 * Bucket Provisioner Plugin for PostGraphile v5
 *
 * Provides an explicit `provisionBucket` reconciliation request mutation for
 * PostGraphile v5.
 */

export { BucketProvisionerPlugin, createBucketProvisionerPlugin } from './plugin';
export { BucketProvisionerPreset } from './preset';
export type {
  ProvisionBucketInput,
  ProvisionBucketPayload,
} from './types';
