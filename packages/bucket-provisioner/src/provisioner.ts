/**
 * Bucket Provisioner — core provisioning logic.
 *
 * Orchestrates S3 bucket creation, privacy configuration, CORS setup,
 * versioning, and lifecycle rules. Uses the AWS SDK S3 client for all
 * operations, which works with any S3-compatible backend (RustFS, MinIO, R2, etc.).
 *
 * Privacy model:
 * - Private/temp buckets: Block All Public Access, no bucket policy, presigned URLs only
 * - Public buckets: Block Public Access partially relaxed, public-read bucket policy applied
 */

import type { S3Client } from '@aws-sdk/client-s3';
import {
  CreateBucketCommand,
  DeleteBucketCorsCommand,
  DeleteBucketPolicyCommand,
  GetBucketCorsCommand,
  GetBucketLifecycleConfigurationCommand,
  GetBucketPolicyCommand,
  GetBucketVersioningCommand,
  GetPublicAccessBlockCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
  PutBucketLifecycleConfigurationCommand,
  PutBucketPolicyCommand,
  PutBucketVersioningCommand,
  PutPublicAccessBlockCommand,
} from '@aws-sdk/client-s3';

import { createS3Client } from './client';
import { buildPrivateCorsRules,buildUploadCorsRules } from './cors';
import { buildTempCleanupRule } from './lifecycle';
import type { BucketPolicyDocument, PublicAccessBlockConfig } from './policies';
import { buildPublicReadPolicy,getPublicAccessBlock } from './policies';
import type {
  BucketAccessType,
  CorsRule,
  CreateBucketOptions,
  LifecycleRule,
  ProvisionResult,
  StorageConnectionConfig,
  UpdateCorsOptions,
} from './types';
import { ProvisionerError } from './types';

/**
 * Error codes an S3-compatible backend answers with when it does not implement
 * a bucket-configuration API at all (older MinIO, some RustFS builds). Matched
 * on the error's code only — never on message text, which AWS fills with the
 * operation and policy names of real failures (an AccessDenied for
 * `s3:PutBucketPolicy` reads "...because no identity-based policy allows...").
 */
const UNSUPPORTED_OPERATION_CODES = ['XmlParseException', 'NotImplemented'];

function errorCode(err: any): string | undefined {
  return err?.Code ?? err?.name;
}

function isUnsupportedOperation(err: any, extraCodes: string[] = []): boolean {
  const code = errorCode(err);
  return code !== undefined && [...UNSUPPORTED_OPERATION_CODES, ...extraCodes].includes(code);
}

/**
 * Options for the BucketProvisioner constructor.
 */
export interface BucketProvisionerOptions {
  /** Storage connection config — credentials, endpoint, provider */
  connection: StorageConnectionConfig;
  /**
   * Default allowed origins for CORS rules.
   * These are the domains where your app runs (e.g., ["https://app.example.com"]).
   * Required for browser-based presigned URL uploads.
   *
   * Empty (or omitted) means no browser origin may reach these buckets — a
   * build's log store, say, which only server-side code ever opens. Such a
   * bucket is provisioned with no CORS rule set at all rather than with a
   * fabricated origin.
   */
  allowedOrigins?: string[];
}

/**
 * The BucketProvisioner handles creating and configuring S3-compatible
 * buckets with the correct privacy settings, CORS rules, and policies
 * for the Constructive storage module.
 *
 * @example
 * ```typescript
 * const provisioner = new BucketProvisioner({
 *   connection: {
 *     provider: 'minio',
 *     region: 'us-east-1',
 *     endpoint: 'http://rustfs:9000',
 *     accessKeyId: 'constructive',
 *     secretAccessKey: 'constructive-dev-secret',
 *   },
 *   allowedOrigins: ['https://app.example.com'],
 * });
 *
 * // Provision a private bucket
 * const result = await provisioner.provision({
 *   bucketName: 'my-app-storage',
 *   accessType: 'private',
 * });
 * ```
 */
export class BucketProvisioner {
  private readonly client: S3Client;
  private readonly config: StorageConnectionConfig;
  private readonly allowedOrigins: string[];

  constructor(options: BucketProvisionerOptions) {
    this.config = options.connection;
    this.allowedOrigins = options.allowedOrigins ?? [];
    this.client = createS3Client(options.connection);
  }

  /**
   * Get the underlying S3Client instance.
   * Useful for advanced operations not covered by the provisioner.
   */
  getClient(): S3Client {
    return this.client;
  }

  /**
   * Provision a fully configured S3 bucket.
   *
   * This is the main entry point. It:
   * 1. Creates the bucket (or verifies it exists)
   * 2. Configures Block Public Access based on access type
   * 3. Applies the appropriate bucket policy (public-read or none)
   * 4. Sets CORS rules for presigned URL uploads
   * 5. Optionally enables versioning
   * 6. Optionally adds lifecycle rules (auto-enabled for temp buckets)
   *
   * @param options - Bucket creation options
   * @returns ProvisionResult with all configuration details
   */
  async provision(options: CreateBucketOptions): Promise<ProvisionResult> {
    const { bucketName, accessType, versioning = false } = options;
    const region = options.region ?? this.config.region;

    // 1. Create the bucket
    await this.createBucket(bucketName, region);

    // 2. Configure Block Public Access
    const publicAccessBlock = getPublicAccessBlock(accessType);
    await this.setPublicAccessBlock(bucketName, publicAccessBlock);

    // 3. Apply bucket policy
    if (accessType === 'public') {
      const policy = buildPublicReadPolicy(bucketName);
      await this.setBucketPolicy(bucketName, policy);
    } else {
      // Ensure no leftover public policy on private/temp buckets
      await this.deleteBucketPolicy(bucketName);
    }

    // 4. Set CORS rules (per-bucket override takes precedence over default).
    // A bucket no browser origin may reach gets no rule set: cross-origin
    // access is the bucket's own recorded data, and "none recorded" is a
    // legitimate answer, not a missing setting to invent an origin for.
    // Provisioning converges, so "none" also clears a rule set an earlier
    // provision wrote for origins the bucket no longer records.
    const effectiveOrigins = options.allowedOrigins ?? this.allowedOrigins;
    const corsRules = effectiveOrigins.length === 0
      ? []
      : accessType === 'private'
        ? buildPrivateCorsRules(effectiveOrigins)
        : buildUploadCorsRules(effectiveOrigins);
    if (corsRules.length > 0) {
      await this.setCors(bucketName, corsRules);
    } else {
      await this.clearCors(bucketName);
    }

    // 5. Versioning
    if (versioning) {
      await this.enableVersioning(bucketName);
    }

    // 6. Lifecycle rules for temp buckets
    const lifecycleRules: LifecycleRule[] = [];
    if (accessType === 'temp') {
      const tempRule = buildTempCleanupRule(1);
      lifecycleRules.push(tempRule);
      await this.setLifecycleRules(bucketName, lifecycleRules);
    }

    // Build result
    const publicUrlPrefix = accessType === 'public'
      ? (options.publicUrlPrefix ?? null)
      : null;

    return {
      bucketName,
      accessType,
      endpoint: this.config.endpoint ?? null,
      provider: this.config.provider,
      region,
      publicUrlPrefix,
      blockPublicAccess: accessType !== 'public',
      versioning,
      corsRules,
      lifecycleRules,
    };
  }

  /**
   * Create an S3 bucket. Handles the "bucket already exists" case gracefully.
   */
  async createBucket(bucketName: string, region?: string): Promise<void> {
    try {
      const command = new CreateBucketCommand({
        Bucket: bucketName,
        ...(region && region !== 'us-east-1'
          ? { CreateBucketConfiguration: { LocationConstraint: region as any } }
          : {}),
      });
      await this.client.send(command);
    } catch (err: any) {
      // Bucket already exists and we own it — that's fine
      if (
        err.name === 'BucketAlreadyOwnedByYou' ||
        err.name === 'BucketAlreadyExists' ||
        err.Code === 'BucketAlreadyOwnedByYou' ||
        err.Code === 'BucketAlreadyExists'
      ) {
        return;
      }
      throw new ProvisionerError(
        'PROVIDER_ERROR',
        `Failed to create bucket '${bucketName}': ${err.message}`,
        err,
      );
    }
  }

  /**
   * Check if a bucket exists and is accessible.
   */
  async bucketExists(bucketName: string): Promise<boolean> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: bucketName }));
      return true;
    } catch (err: any) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return false;
      }
      if (err.$metadata?.httpStatusCode === 403) {
        throw new ProvisionerError(
          'ACCESS_DENIED',
          `Access denied to bucket '${bucketName}'`,
          err,
        );
      }
      throw new ProvisionerError(
        'PROVIDER_ERROR',
        `Failed to check bucket '${bucketName}': ${err.message}`,
        err,
      );
    }
  }

  /**
   * Configure S3 Block Public Access settings.
   *
   * Skips only when the S3-compatible backend (e.g. MinIO) answers that it
   * does not implement PutPublicAccessBlock; every other failure throws.
   */
  async setPublicAccessBlock(
    bucketName: string,
    config: PublicAccessBlockConfig,
  ): Promise<void> {
    try {
      await this.client.send(
        new PutPublicAccessBlockCommand({
          Bucket: bucketName,
          PublicAccessBlockConfiguration: config,
        }),
      );
    } catch (err: any) {
      // Some S3-compatible backends (e.g. older MinIO) don't implement
      // PutPublicAccessBlock; the bucket is still usable without it.
      if (isUnsupportedOperation(err)) {
        return;
      }
      throw new ProvisionerError(
        'POLICY_FAILED',
        `Failed to set public access block on '${bucketName}': ${err.message}`,
        err,
      );
    }
  }

  /**
   * Apply an S3 bucket policy.
   *
   * Skips only when the S3-compatible backend answers that it does not
   * implement PutBucketPolicy; every other failure (AccessDenied, a blocked
   * public policy, a malformed document) throws.
   */
  async setBucketPolicy(
    bucketName: string,
    policy: BucketPolicyDocument,
  ): Promise<void> {
    try {
      await this.client.send(
        new PutBucketPolicyCommand({
          Bucket: bucketName,
          Policy: JSON.stringify(policy),
        }),
      );
    } catch (err: any) {
      // Some S3-compatible backends don't implement bucket policies.
      if (isUnsupportedOperation(err)) {
        return;
      }
      throw new ProvisionerError(
        'POLICY_FAILED',
        `Failed to set bucket policy on '${bucketName}': ${err.message}`,
        err,
      );
    }
  }

  /**
   * Delete an S3 bucket policy (used to clear leftover public policies).
   *
   * Gracefully handles backends that don't support this operation or have
   * no policy to delete.
   */
  async deleteBucketPolicy(bucketName: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteBucketPolicyCommand({ Bucket: bucketName }),
      );
    } catch (err: any) {
      // No policy to delete — that's fine
      if (
        errorCode(err) === 'NoSuchBucketPolicy' ||
        err.$metadata?.httpStatusCode === 404 ||
        isUnsupportedOperation(err)
      ) {
        return;
      }
      throw new ProvisionerError(
        'POLICY_FAILED',
        `Failed to delete bucket policy on '${bucketName}': ${err.message}`,
        err,
      );
    }
  }

  /**
   * Set CORS configuration on an S3 bucket.
   *
   * Skips only when the S3-compatible backend (e.g. older MinIO) answers
   * that it does not implement PutBucketCors; every other failure throws.
   */
  async setCors(bucketName: string, rules: CorsRule[]): Promise<void> {
    try {
      await this.client.send(
        new PutBucketCorsCommand({
          Bucket: bucketName,
          CORSConfiguration: {
            CORSRules: rules.map((rule) => ({
              AllowedOrigins: rule.allowedOrigins,
              AllowedMethods: rule.allowedMethods,
              AllowedHeaders: rule.allowedHeaders,
              ExposeHeaders: rule.exposedHeaders,
              MaxAgeSeconds: rule.maxAgeSeconds,
            })),
          },
        }),
      );
    } catch (err: any) {
      // Some S3-compatible backends (e.g. older MinIO) don't implement
      // PutBucketCors.
      if (isUnsupportedOperation(err)) {
        return;
      }
      throw new ProvisionerError(
        'CORS_FAILED',
        `Failed to set CORS on '${bucketName}': ${err.message}`,
        err,
      );
    }
  }

  /**
   * Remove the CORS configuration from an S3 bucket, so no browser origin may
   * reach it. A bucket that has none already is the converged state.
   */
  async clearCors(bucketName: string): Promise<void> {
    try {
      await this.client.send(new DeleteBucketCorsCommand({ Bucket: bucketName }));
    } catch (err: any) {
      if (errorCode(err) === 'NoSuchCORSConfiguration' || isUnsupportedOperation(err)) {
        return;
      }
      throw new ProvisionerError(
        'CORS_FAILED',
        `Failed to clear CORS on '${bucketName}': ${err.message}`,
        err,
      );
    }
  }

  /**
   * Enable versioning on an S3 bucket.
   *
   * Skips only when the S3-compatible backend (e.g. MinIO edge-cicd)
   * answers that it does not implement PutBucketVersioning.
   */
  async enableVersioning(bucketName: string): Promise<void> {
    try {
      await this.client.send(
        new PutBucketVersioningCommand({
          Bucket: bucketName,
          VersioningConfiguration: { Status: 'Enabled' },
        }),
      );
    } catch (err: any) {
      // Some S3-compatible backends (e.g. MinIO edge-cicd) don't implement
      // PutBucketVersioning.
      if (isUnsupportedOperation(err)) {
        return;
      }
      throw new ProvisionerError(
        'VERSIONING_FAILED',
        `Failed to enable versioning on '${bucketName}': ${err.message}`,
        err,
      );
    }
  }

  /**
   * Set lifecycle rules on an S3 bucket.
   *
   * Skips only when the S3-compatible backend (e.g. MinIO edge-cicd)
   * answers that it does not implement PutBucketLifecycleConfiguration.
   */
  async setLifecycleRules(
    bucketName: string,
    rules: LifecycleRule[],
  ): Promise<void> {
    try {
      await this.client.send(
        new PutBucketLifecycleConfigurationCommand({
          Bucket: bucketName,
          LifecycleConfiguration: {
            Rules: rules.map((rule) => ({
              ID: rule.id,
              Filter: { Prefix: rule.prefix },
              Status: rule.enabled ? 'Enabled' : 'Disabled',
              Expiration: { Days: rule.expirationDays },
            })),
          },
        }),
      );
    } catch (err: any) {
      // Some S3-compatible backends (e.g. MinIO edge-cicd) don't implement
      // PutBucketLifecycleConfiguration, or require a Content-MD5 header the
      // SDK doesn't send.
      if (isUnsupportedOperation(err, ['MissingContentMD5'])) {
        return;
      }
      throw new ProvisionerError(
        'LIFECYCLE_FAILED',
        `Failed to set lifecycle rules on '${bucketName}': ${err.message}`,
        err,
      );
    }
  }

  /**
   * Update CORS configuration on an existing S3 bucket.
   *
   * Call this when the `allowed_origins` column changes on a bucket row.
   * Builds the appropriate CORS rule set for the bucket's access type
   * and applies it to the S3 bucket.
   *
   * @param options - Bucket name, access type, and new allowed origins
   * @returns The CORS rules that were applied
   */
  async updateCors(options: UpdateCorsOptions): Promise<CorsRule[]> {
    const { bucketName, accessType, allowedOrigins } = options;

    if (!allowedOrigins || allowedOrigins.length === 0) {
      throw new ProvisionerError(
        'INVALID_CONFIG',
        'allowedOrigins must contain at least one origin for CORS configuration',
      );
    }

    const corsRules = accessType === 'private'
      ? buildPrivateCorsRules(allowedOrigins)
      : buildUploadCorsRules(allowedOrigins);

    await this.setCors(bucketName, corsRules);
    return corsRules;
  }

  /**
   * Inspect the current configuration of an existing bucket.
   *
   * Reads the bucket's policy, CORS, versioning, lifecycle, and public access
   * settings and returns them in a structured format. Useful for auditing
   * or verifying that a bucket is correctly configured.
   *
   * @param bucketName - S3 bucket name
   * @param accessType - Expected access type (used in the result)
   */
  async inspect(bucketName: string, accessType: BucketAccessType): Promise<ProvisionResult> {
    const exists = await this.bucketExists(bucketName);
    if (!exists) {
      throw new ProvisionerError(
        'BUCKET_NOT_FOUND',
        `Bucket '${bucketName}' does not exist`,
      );
    }

    // Read all configurations in parallel
    const [publicAccessBlock, policy, cors, versioning, lifecycle] = await Promise.all([
      this.getPublicAccessBlock(bucketName),
      this.getBucketPolicy(bucketName),
      this.getBucketCors(bucketName),
      this.getBucketVersioning(bucketName),
      this.getBucketLifecycle(bucketName),
    ]);

    const isFullyBlocked = publicAccessBlock
      ? publicAccessBlock.BlockPublicAcls === true &&
        publicAccessBlock.IgnorePublicAcls === true &&
        publicAccessBlock.BlockPublicPolicy === true &&
        publicAccessBlock.RestrictPublicBuckets === true
      : false;

    return {
      bucketName,
      accessType,
      endpoint: this.config.endpoint ?? null,
      provider: this.config.provider,
      region: this.config.region,
      publicUrlPrefix: null,
      blockPublicAccess: isFullyBlocked,
      versioning: versioning === 'Enabled',
      corsRules: cors,
      lifecycleRules: lifecycle,
    };
  }

  // --- Private read methods for inspect ---

  private async getPublicAccessBlock(
    bucketName: string,
  ): Promise<PublicAccessBlockConfig | null> {
    try {
      const result = await this.client.send(
        new GetPublicAccessBlockCommand({ Bucket: bucketName }),
      );
      const config = result.PublicAccessBlockConfiguration;
      if (!config) return null;
      return {
        BlockPublicAcls: config.BlockPublicAcls ?? false,
        IgnorePublicAcls: config.IgnorePublicAcls ?? false,
        BlockPublicPolicy: config.BlockPublicPolicy ?? false,
        RestrictPublicBuckets: config.RestrictPublicBuckets ?? false,
      };
    } catch {
      return null;
    }
  }

  private async getBucketPolicy(
    bucketName: string,
  ): Promise<BucketPolicyDocument | null> {
    try {
      const result = await this.client.send(
        new GetBucketPolicyCommand({ Bucket: bucketName }),
      );
      return result.Policy ? JSON.parse(result.Policy) : null;
    } catch {
      return null;
    }
  }

  private async getBucketCors(bucketName: string): Promise<CorsRule[]> {
    try {
      const result = await this.client.send(
        new GetBucketCorsCommand({ Bucket: bucketName }),
      );
      return (result.CORSRules ?? []).map((rule) => ({
        allowedOrigins: rule.AllowedOrigins ?? [],
        allowedMethods: (rule.AllowedMethods ?? []) as CorsRule['allowedMethods'],
        allowedHeaders: rule.AllowedHeaders ?? [],
        exposedHeaders: rule.ExposeHeaders ?? [],
        maxAgeSeconds: rule.MaxAgeSeconds ?? 0,
      }));
    } catch {
      return [];
    }
  }

  private async getBucketVersioning(bucketName: string): Promise<string> {
    try {
      const result = await this.client.send(
        new GetBucketVersioningCommand({ Bucket: bucketName }),
      );
      return result.Status ?? 'Disabled';
    } catch {
      return 'Disabled';
    }
  }

  private async getBucketLifecycle(bucketName: string): Promise<LifecycleRule[]> {
    try {
      const result = await this.client.send(
        new GetBucketLifecycleConfigurationCommand({ Bucket: bucketName }),
      );
      return (result.Rules ?? []).map((rule) => ({
        id: rule.ID ?? '',
        prefix: (rule.Filter as any)?.Prefix ?? '',
        expirationDays: rule.Expiration?.Days ?? 0,
        enabled: rule.Status === 'Enabled',
      }));
    } catch {
      return [];
    }
  }
}
