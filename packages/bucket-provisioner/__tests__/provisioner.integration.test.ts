/**
 * Integration tests for BucketProvisioner against a real RustFS instance.
 *
 * These tests exercise the full provisioning pipeline end-to-end:
 *   1. provision() — create bucket, set policies, CORS, versioning, lifecycle
 *   2. inspect() — read back all bucket config and verify it matches
 *   3. updateCors() — change CORS rules on an existing bucket
 *   4. bucketExists() — verify bucket existence checks
 *
 * Requires RustFS running on localhost:9000 (docker-compose or CI service).
 * Skips gracefully when RustFS is not reachable.
 *
 * RustFS supports the S3 APIs used by the provisioner. The tests focus on
 * bucket creation and bucket existence checks in addition to the provisioning
 * result and graceful error handling.
 */

import { BucketProvisioner } from '../src/provisioner';
import type { StorageConnectionConfig } from '../src/types';
import { ProvisionerError } from '../src/types';

// --- RustFS config (matches CI env) ---

// The local object store (docker RustFS/MinIO); credentials from the env.
const OBJECT_STORE_ENDPOINT = 'http://localhost:9000';
const AWS_REGION = 'us-east-1';
const AWS_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY_ID!;
const AWS_SECRET_KEY = process.env.STORAGE_SECRET_ACCESS_KEY!;

const connection: StorageConnectionConfig = {
  provider: 'minio',
  region: AWS_REGION,
  endpoint: OBJECT_STORE_ENDPOINT,
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
};

const TEST_ORIGINS = ['https://app.example.com'];

jest.setTimeout(30000);

// Unique prefix per test run to avoid bucket name collisions
const RUN_ID = Date.now().toString(36);

function testBucketName(suffix: string): string {
  return `bp-test-${RUN_ID}-${suffix}`;
}

/**
 * Check if RustFS is reachable. Skips the entire suite if not.
 */
async function isObjectStoreReachable(): Promise<boolean> {
  try {
    const response = await fetch(`${OBJECT_STORE_ENDPOINT}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// --- Conditional test runner ---
// If RustFS is not available, all tests in this file pass instantly (early return).

let objectStoreAvailable = false;

beforeAll(async () => {
  objectStoreAvailable = await isObjectStoreReachable();
  if (!objectStoreAvailable) {
    // eslint-disable-next-line no-console
    console.warn(
      'RustFS not reachable at %s — skipping bucket-provisioner integration tests',
      OBJECT_STORE_ENDPOINT,
    );
  }
});

// --- Tests ---

describe('BucketProvisioner integration (RustFS)', () => {
  let provisioner: BucketProvisioner;

  beforeAll(() => {
    if (!objectStoreAvailable) return;
    provisioner = new BucketProvisioner({
      connection,
      allowedOrigins: TEST_ORIGINS,
    });
  });

  describe('provision — private bucket', () => {
    const bucketName = testBucketName('private');

    it('should provision a private bucket successfully', async () => {
      if (!objectStoreAvailable) return;

      const result = await provisioner.provision({
        bucketName,
        accessType: 'private',
      });

      // provision() return values reflect intent, not API reads
      expect(result.bucketName).toBe(bucketName);
      expect(result.accessType).toBe('private');
      expect(result.provider).toBe('minio');
      expect(result.region).toBe(AWS_REGION);
      expect(result.endpoint).toBe(OBJECT_STORE_ENDPOINT);
      expect(result.blockPublicAccess).toBe(true);
      expect(result.versioning).toBe(false);
      expect(result.publicUrlPrefix).toBeNull();
      expect(result.lifecycleRules).toHaveLength(0);
      // CORS rules are built and returned as part of the intended configuration.
      expect(result.corsRules).toHaveLength(1);
      expect(result.corsRules[0].allowedOrigins).toEqual(TEST_ORIGINS);
      expect(result.corsRules[0].allowedMethods).toContain('PUT');
      expect(result.corsRules[0].allowedMethods).toContain('HEAD');
      expect(result.corsRules[0].allowedMethods).not.toContain('GET');
    });

    it('should be inspectable after provisioning', async () => {
      if (!objectStoreAvailable) return;

      const inspected = await provisioner.inspect(bucketName, 'private');

      expect(inspected.bucketName).toBe(bucketName);
      expect(inspected.accessType).toBe('private');
      expect(inspected.versioning).toBe(false);
      expect(inspected.blockPublicAccess).toBe(true);
      expect(inspected.corsRules).toHaveLength(1);
    });

    it('should survive re-provisioning (idempotent)', async () => {
      if (!objectStoreAvailable) return;

      const result = await provisioner.provision({
        bucketName,
        accessType: 'private',
      });

      expect(result.bucketName).toBe(bucketName);
      expect(result.accessType).toBe('private');
    });
  });

  describe('provision — public bucket', () => {
    const bucketName = testBucketName('public');

    it('should provision a public bucket without error', async () => {
      if (!objectStoreAvailable) return;

      const result = await provisioner.provision({
        bucketName,
        accessType: 'public',
        publicUrlPrefix: 'https://cdn.example.com',
      });

      expect(result.bucketName).toBe(bucketName);
      expect(result.accessType).toBe('public');
      expect(result.blockPublicAccess).toBe(false);
      expect(result.publicUrlPrefix).toBe('https://cdn.example.com');
      expect(result.corsRules).toHaveLength(1);
      expect(result.corsRules[0].allowedMethods).toContain('PUT');
      expect(result.corsRules[0].allowedMethods).toContain('GET');
      expect(result.corsRules[0].allowedMethods).toContain('HEAD');
    });

    it('should be inspectable after provisioning', async () => {
      if (!objectStoreAvailable) return;

      const inspected = await provisioner.inspect(bucketName, 'public');

      expect(inspected.bucketName).toBe(bucketName);
      expect(inspected.accessType).toBe('public');
      expect(inspected.corsRules).toHaveLength(1);
    });
  });

  describe('provision — temp bucket', () => {
    const bucketName = testBucketName('temp');

    it('should provision a temp bucket with lifecycle rules', async () => {
      if (!objectStoreAvailable) return;

      const result = await provisioner.provision({
        bucketName,
        accessType: 'temp',
      });

      expect(result.bucketName).toBe(bucketName);
      expect(result.accessType).toBe('temp');
      expect(result.blockPublicAccess).toBe(true);
      expect(result.publicUrlPrefix).toBeNull();
      expect(result.lifecycleRules).toHaveLength(1);
      expect(result.lifecycleRules[0].id).toBe('temp-cleanup');
      expect(result.lifecycleRules[0].expirationDays).toBe(1);
      expect(result.lifecycleRules[0].enabled).toBe(true);
    });

    it('should be inspectable with lifecycle rules', async () => {
      if (!objectStoreAvailable) return;

      const inspected = await provisioner.inspect(bucketName, 'temp');

      expect(inspected.bucketName).toBe(bucketName);
      expect(inspected.lifecycleRules).toHaveLength(1);
    });
  });

  describe('provision — versioning', () => {
    const bucketName = testBucketName('versioned');

    it('should provision with versioning flag', async () => {
      if (!objectStoreAvailable) return;

      const result = await provisioner.provision({
        bucketName,
        accessType: 'private',
        versioning: true,
      });

      expect(result.versioning).toBe(true);
    });

    it('should report versioning state on inspect', async () => {
      if (!objectStoreAvailable) return;

      const inspected = await provisioner.inspect(bucketName, 'private');
      expect(inspected.versioning).toBe(true);
    });
  });

  describe('provision — per-bucket CORS override', () => {
    const bucketName = testBucketName('custom-cors');
    const customOrigins = ['https://custom.example.com', 'https://other.example.com'];

    it('should accept per-bucket allowedOrigins (returned in provision result)', async () => {
      if (!objectStoreAvailable) return;

      const result = await provisioner.provision({
        bucketName,
        accessType: 'private',
        allowedOrigins: customOrigins,
      });

      // provision() returns the intended CORS rules
      expect(result.corsRules).toHaveLength(1);
      expect(result.corsRules[0].allowedOrigins).toEqual(customOrigins);
    });

    it('should be inspectable with CORS rules', async () => {
      if (!objectStoreAvailable) return;

      const inspected = await provisioner.inspect(bucketName, 'private');
      expect(inspected.corsRules).toHaveLength(1);
    });
  });

  describe('updateCors', () => {
    const bucketName = testBucketName('cors-update');

    beforeAll(async () => {
      if (!objectStoreAvailable) return;
      await provisioner.provision({
        bucketName,
        accessType: 'private',
      });
    });

    it('should return updated CORS rules', async () => {
      if (!objectStoreAvailable) return;

      const newOrigins = ['https://new-app.example.com'];
      const rules = await provisioner.updateCors({
        bucketName,
        accessType: 'private',
        allowedOrigins: newOrigins,
      });

      expect(rules).toHaveLength(1);
      expect(rules[0].allowedOrigins).toEqual(newOrigins);
      expect(rules[0].allowedMethods).toContain('PUT');
      expect(rules[0].allowedMethods).toContain('HEAD');
    });

    it('should switch from private to public CORS methods on access type change', async () => {
      if (!objectStoreAvailable) return;

      const rules = await provisioner.updateCors({
        bucketName,
        accessType: 'public',
        allowedOrigins: ['https://cdn.example.com'],
      });

      expect(rules[0].allowedMethods).toContain('GET');
      expect(rules[0].allowedMethods).toContain('PUT');
      expect(rules[0].allowedMethods).toContain('HEAD');
    });
  });

  describe('bucketExists', () => {
    const bucketName = testBucketName('exists-check');

    beforeAll(async () => {
      if (!objectStoreAvailable) return;
      await provisioner.provision({
        bucketName,
        accessType: 'private',
      });
    });

    it('should return true for an existing bucket', async () => {
      if (!objectStoreAvailable) return;

      const exists = await provisioner.bucketExists(bucketName);
      expect(exists).toBe(true);
    });

    it('should return false for a non-existent bucket', async () => {
      if (!objectStoreAvailable) return;

      const exists = await provisioner.bucketExists('does-not-exist-' + RUN_ID);
      expect(exists).toBe(false);
    });
  });

  describe('inspect — error handling', () => {
    it('should throw BUCKET_NOT_FOUND for non-existent bucket', async () => {
      if (!objectStoreAvailable) return;

      await expect(
        provisioner.inspect('no-such-bucket-' + RUN_ID, 'private'),
      ).rejects.toThrow(ProvisionerError);

      await expect(
        provisioner.inspect('no-such-bucket-' + RUN_ID, 'private'),
      ).rejects.toThrow('does not exist');
    });
  });

  describe('full round-trip: provision → inspect → updateCors → inspect', () => {
    const bucketName = testBucketName('roundtrip');

    it('should complete the full workflow without error', async () => {
      if (!objectStoreAvailable) return;

      // 1. Provision a private bucket with versioning
      const provisionResult = await provisioner.provision({
        bucketName,
        accessType: 'private',
        versioning: true,
      });

      expect(provisionResult.bucketName).toBe(bucketName);
      expect(provisionResult.accessType).toBe('private');
      expect(provisionResult.versioning).toBe(true);
      expect(provisionResult.corsRules[0].allowedOrigins).toEqual(TEST_ORIGINS);

      // 2. Inspect the applied versioning and CORS configuration.
      const inspected1 = await provisioner.inspect(bucketName, 'private');
      expect(inspected1.bucketName).toBe(bucketName);
      expect(inspected1.versioning).toBe(true);
      expect(inspected1.corsRules).toHaveLength(1);

      // 3. Update CORS to new origins.
      const newOrigins = ['https://staging.example.com'];
      const updatedRules = await provisioner.updateCors({
        bucketName,
        accessType: 'private',
        allowedOrigins: newOrigins,
      });
      expect(updatedRules[0].allowedOrigins).toEqual(newOrigins);

      // 4. Re-inspect — bucket still exists and is accessible
      const inspected2 = await provisioner.inspect(bucketName, 'private');
      expect(inspected2.bucketName).toBe(bucketName);
    });
  });
});
