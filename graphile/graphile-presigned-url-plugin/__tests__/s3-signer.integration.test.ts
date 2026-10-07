/**
 * Integration tests for s3-signer against a real RustFS instance.
 *
 * These tests exercise the presigned URL pipeline end-to-end:
 *   1. generatePresignedPutUrl → PUT a file via the presigned URL
 *   2. headObject → verify the file exists with correct metadata
 *   3. generatePresignedGetUrl → GET the file via the presigned URL
 *
 * Requires RustFS running on localhost:9000 (docker-compose or CI service).
 */

import { S3Client } from '@aws-sdk/client-s3';
import { createS3Bucket } from '@constructive-io/s3-utils';

import {
  deleteS3Object,
  generatePresignedGetUrl,
  generatePresignedPutUrl,
  headObject,
  readObjectPrefix,
} from '../src/s3-signer';
import type { S3Config } from '../src/types';

// --- RustFS config (matches docker-compose.yml + CI env) ---

// The local object store (docker RustFS/MinIO); credentials from the env.
const OBJECT_STORE_ENDPOINT = 'http://localhost:9000';
const AWS_REGION = 'us-east-1';
const AWS_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY_ID!;
const AWS_SECRET_KEY = process.env.STORAGE_SECRET_ACCESS_KEY!;
const TEST_BUCKET = 'presigned-url-test-bucket';

// --- S3 client + config ---

const s3Client = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
  region: AWS_REGION,
  endpoint: OBJECT_STORE_ENDPOINT,
  forcePathStyle: true,
});

const s3Config: S3Config = {
  client: s3Client,
  bucket: TEST_BUCKET,
  endpoint: OBJECT_STORE_ENDPOINT,
  region: AWS_REGION,
  forcePathStyle: true,
};

jest.setTimeout(30000);

// --- Setup / Teardown ---

beforeAll(async () => {
  const result = await createS3Bucket(s3Client, TEST_BUCKET, { provider: 'minio' });
  if (!result.success) throw new Error('Failed to create test S3 bucket');
});

afterAll(() => {
  s3Client.destroy();
});

// --- Test helpers ---

/**
 * Upload content to a presigned PUT URL using native fetch.
 */
async function uploadToPresignedUrl(
  url: string,
  body: string,
  contentType: string,
): Promise<Response> {
  return fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(Buffer.byteLength(body)),
    },
    body,
  });
}

/**
 * Download content from a presigned GET URL using native fetch.
 */
async function downloadFromPresignedUrl(url: string): Promise<{
  status: number;
  body: string;
  contentType: string | null;
}> {
  const response = await fetch(url);
  const body = await response.text();
  return {
    status: response.status,
    body,
    contentType: response.headers.get('content-type'),
  };
}

// --- Tests ---

describe('s3-signer integration (RustFS)', () => {
  describe('generatePresignedPutUrl', () => {
    it('should generate a presigned PUT URL that accepts a valid upload', async () => {
      const key = 'test-put-basic.txt';
      const content = 'Hello, presigned upload!';
      const contentType = 'text/plain';
      const contentLength = Buffer.byteLength(content);

      const putUrl = await generatePresignedPutUrl(
        s3Config,
        key,
        contentType,
        contentLength,
        900,
      );

      expect(putUrl).toBeDefined();
      expect(putUrl).toContain(TEST_BUCKET);
      expect(putUrl).toContain(key);

      // Actually upload via the presigned URL
      const response = await uploadToPresignedUrl(putUrl, content, contentType);
      expect(response.status).toBe(200);
    });

    it('should generate unique URLs for different keys', async () => {
      const contentType = 'text/plain';
      const contentLength = 5;

      const url1 = await generatePresignedPutUrl(s3Config, 'key-a.txt', contentType, contentLength);
      const url2 = await generatePresignedPutUrl(s3Config, 'key-b.txt', contentType, contentLength);

      expect(url1).not.toBe(url2);
      expect(url1).toContain('key-a.txt');
      expect(url2).toContain('key-b.txt');
    });

    it('should respect custom expiry', async () => {
      const url = await generatePresignedPutUrl(s3Config, 'expiry-test.txt', 'text/plain', 5, 60);
      // The URL should contain expiry-related query params
      expect(url).toContain('X-Amz-Expires=60');
    });
  });

  describe('headObject', () => {
    const HEAD_KEY = 'test-head-object.json';
    const HEAD_CONTENT = JSON.stringify({ test: true });
    const HEAD_CONTENT_TYPE = 'application/json';

    beforeAll(async () => {
      // Upload a file first so we can HEAD it
      const putUrl = await generatePresignedPutUrl(
        s3Config,
        HEAD_KEY,
        HEAD_CONTENT_TYPE,
        Buffer.byteLength(HEAD_CONTENT),
      );
      const res = await uploadToPresignedUrl(putUrl, HEAD_CONTENT, HEAD_CONTENT_TYPE);
      if (res.status !== 200) throw new Error(`Setup upload failed: ${res.status}`);
    });

    it('should return metadata for an existing object', async () => {
      const result = await headObject(s3Config, HEAD_KEY);

      expect(result).not.toBeNull();
      expect(result!.contentType).toBe(HEAD_CONTENT_TYPE);
      expect(result!.contentLength).toBe(Buffer.byteLength(HEAD_CONTENT));
    });

    it('should return null for a non-existent object', async () => {
      const result = await headObject(s3Config, 'does-not-exist-' + Date.now());
      expect(result).toBeNull();
    });

    it('should log a warning when content-type mismatches (but still return metadata)', async () => {
      const result = await headObject(s3Config, HEAD_KEY, 'text/plain');

      // headObject still returns metadata even on mismatch — it just logs a warning
      expect(result).not.toBeNull();
      expect(result!.contentType).toBe(HEAD_CONTENT_TYPE); // actual type, not expected
    });
  });

  describe('readObjectPrefix', () => {
    const PREFIX_KEY = 'test-read-prefix.bin';
    // Longer than the range this reads, so a truncated response proves the range
    // was honoured rather than the whole object downloaded.
    const PREFIX_CONTENT = 'ABCDEFGHIJ'.repeat(100);

    beforeAll(async () => {
      const putUrl = await generatePresignedPutUrl(
        s3Config,
        PREFIX_KEY,
        'application/octet-stream',
        Buffer.byteLength(PREFIX_CONTENT),
      );
      const res = await uploadToPresignedUrl(putUrl, PREFIX_CONTENT, 'application/octet-stream');
      if (res.status !== 200) throw new Error(`Setup upload failed: ${res.status}`);
    });

    it('should read only the requested leading bytes', async () => {
      const prefix = await readObjectPrefix(s3Config, PREFIX_KEY, 10);

      expect(prefix).not.toBeNull();
      expect(prefix!.length).toBe(10);
      expect(prefix!.toString()).toBe('ABCDEFGHIJ');
    });

    it('should return the whole object when it is shorter than the range', async () => {
      const prefix = await readObjectPrefix(s3Config, PREFIX_KEY, 100000);
      expect(prefix!.length).toBe(Buffer.byteLength(PREFIX_CONTENT));
    });

    it('should return null for a non-existent object', async () => {
      const prefix = await readObjectPrefix(s3Config, 'does-not-exist-' + Date.now(), 32);
      expect(prefix).toBeNull();
    });
  });

  describe('generatePresignedGetUrl', () => {
    const GET_KEY = 'test-get-download.txt';
    const GET_CONTENT = 'Downloadable content for presigned GET test';
    const GET_CONTENT_TYPE = 'text/plain';

    beforeAll(async () => {
      const putUrl = await generatePresignedPutUrl(
        s3Config,
        GET_KEY,
        GET_CONTENT_TYPE,
        Buffer.byteLength(GET_CONTENT),
      );
      const res = await uploadToPresignedUrl(putUrl, GET_CONTENT, GET_CONTENT_TYPE);
      if (res.status !== 200) throw new Error(`Setup upload failed: ${res.status}`);
    });

    it('should generate a presigned GET URL that returns the file content', async () => {
      const getUrl = await generatePresignedGetUrl(s3Config, GET_KEY, 3600);

      expect(getUrl).toBeDefined();
      expect(getUrl).toContain(TEST_BUCKET);
      expect(getUrl).toContain(GET_KEY);

      const { status, body, contentType } = await downloadFromPresignedUrl(getUrl);
      expect(status).toBe(200);
      expect(body).toBe(GET_CONTENT);
      expect(contentType).toContain('text/plain');
    });

    it('should include Content-Disposition when filename is provided', async () => {
      const getUrl = await generatePresignedGetUrl(s3Config, GET_KEY, 3600, 'my-download.txt');

      expect(getUrl).toContain('response-content-disposition');

      const response = await fetch(getUrl);
      expect(response.status).toBe(200);

      const disposition = response.headers.get('content-disposition');
      expect(disposition).toContain('my-download.txt');
    });

    it('should respect custom expiry', async () => {
      const url = await generatePresignedGetUrl(s3Config, GET_KEY, 120);
      expect(url).toContain('X-Amz-Expires=120');
    });
  });

  describe('deleteS3Object', () => {
    it('should delete an existing object from S3', async () => {
      const key = 'test-delete-' + Date.now() + '.txt';
      const content = 'file to delete';
      const contentType = 'text/plain';

      // Upload a file first
      const putUrl = await generatePresignedPutUrl(
        s3Config,
        key,
        contentType,
        Buffer.byteLength(content),
      );
      const putRes = await uploadToPresignedUrl(putUrl, content, contentType);
      expect(putRes.status).toBe(200);

      // Verify it exists
      const beforeHead = await headObject(s3Config, key);
      expect(beforeHead).not.toBeNull();

      // Delete it
      await deleteS3Object(s3Config, key);

      // Verify it's gone
      const afterHead = await headObject(s3Config, key);
      expect(afterHead).toBeNull();
    });

    it('should be idempotent (no error deleting non-existent key)', async () => {
      await expect(
        deleteS3Object(s3Config, 'non-existent-key-' + Date.now()),
      ).resolves.toBeUndefined();
    });
  });

  describe('full round-trip: PUT → HEAD → GET', () => {
    it('should upload, verify, and download a text payload', async () => {
      const key = 'roundtrip-test-' + Date.now() + '.txt';
      const content = 'round-trip integration test content — special chars: é, ñ, ü';
      const contentType = 'text/plain';

      // 1. Generate presigned PUT URL
      const putUrl = await generatePresignedPutUrl(
        s3Config,
        key,
        contentType,
        Buffer.byteLength(content),
      );

      // 2. Upload via presigned URL
      const putResponse = await uploadToPresignedUrl(putUrl, content, contentType);
      expect(putResponse.status).toBe(200);

      // 3. HEAD — verify object exists with correct metadata
      const headResult = await headObject(s3Config, key, contentType);
      expect(headResult).not.toBeNull();
      expect(headResult!.contentType).toBe(contentType);
      expect(headResult!.contentLength).toBe(Buffer.byteLength(content));

      // 4. Generate presigned GET URL
      const getUrl = await generatePresignedGetUrl(s3Config, key, 3600);

      // 5. Download and verify content
      const { status, body } = await downloadFromPresignedUrl(getUrl);
      expect(status).toBe(200);
      expect(body).toBe(content);
    });

    it('should handle content-addressed keys (SHA-256 hex)', async () => {
      // Simulates the actual plugin pattern: key = contentHash
      const contentHash = 'a'.repeat(64); // fake SHA-256 hex
      const content = 'content-addressed file data';
      const contentType = 'text/plain';

      const putUrl = await generatePresignedPutUrl(
        s3Config,
        contentHash,
        contentType,
        Buffer.byteLength(content),
      );
      const putRes = await uploadToPresignedUrl(putUrl, content, contentType);
      expect(putRes.status).toBe(200);

      const headResult = await headObject(s3Config, contentHash, contentType);
      expect(headResult).not.toBeNull();
      expect(headResult!.contentType).toBe(contentType);

      const getUrl = await generatePresignedGetUrl(s3Config, contentHash, 3600);
      const { status, body } = await downloadFromPresignedUrl(getUrl);
      expect(status).toBe(200);
      expect(body).toBe(content);
    });

    it('should handle various MIME types correctly', async () => {
      const testCases = [
        { ext: 'html', type: 'text/html', content: '<h1>Hello</h1>' },
        { ext: 'json', type: 'application/json', content: '{"key":"value"}' },
        { ext: 'csv', type: 'text/csv', content: 'a,b,c\n1,2,3' },
      ];

      for (const { ext, type, content } of testCases) {
        const key = `mime-test-${Date.now()}.${ext}`;

        const putUrl = await generatePresignedPutUrl(
          s3Config,
          key,
          type,
          Buffer.byteLength(content),
        );
        const putRes = await uploadToPresignedUrl(putUrl, content, type);
        expect(putRes.status).toBe(200);

        const headResult = await headObject(s3Config, key, type);
        expect(headResult).not.toBeNull();
        expect(headResult!.contentType).toBe(type);

        const getUrl = await generatePresignedGetUrl(s3Config, key, 3600);
        const { status, body } = await downloadFromPresignedUrl(getUrl);
        expect(status).toBe(200);
        expect(body).toBe(content);
      }
    });
  });
});
