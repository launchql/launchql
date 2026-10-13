/**
 * The presigned lane's diagnosis of a failed S3 call.
 *
 * The case that motivated this: a server signing against an endpoint it cannot
 * reach (its own loopback), and the transport failure
 * arrives as an `AggregateError` with an empty `message` — so reporting
 * `err.message` gave the client a blank reason. These assert that the reason is
 * never blank, that it names the coordinates, and that the original error stays
 * reachable as `cause`.
 */

import {
  assertBucketReconciled,
  StorageBucketNotReconciledError,
} from '../src/physical-bucket';
import { describeS3Failure, s3FailureError } from '../src/s3-failure';
import { generatePresignedPutUrl } from '../src/s3-signer';
import type { BucketConfig } from '../src/types';

/** An unreachable endpoint, as undici surfaces it: no message of its own. */
function connectionRefused(): AggregateError {
  const inner: any = new Error('connect ECONNREFUSED 127.0.0.1:9000');
  inner.name = 'Error';
  inner.code = 'ECONNREFUSED';
  const aggregate = new AggregateError([inner], '');
  return aggregate;
}

describe('describeS3Failure', () => {
  it('reads through an AggregateError with an empty message to its causes', () => {
    const described = describeS3Failure(connectionRefused());

    expect(described).toContain('AggregateError');
    expect(described).toContain('ECONNREFUSED 127.0.0.1:9000');
  });

  it('reads through a cause chain', () => {
    const described = describeS3Failure(
      new Error('', { cause: new Error('socket hang up') }),
    );

    expect(described).toContain('socket hang up');
  });

  it('keeps an S3 service error name and status', () => {
    const err: any = new Error('Access Denied');
    err.name = 'AccessDenied';
    err.$metadata = { httpStatusCode: 403 };

    expect(describeS3Failure(err)).toBe('AccessDenied: Access Denied HTTP 403');
  });

  it('never describes a failure as nothing', () => {
    expect(describeS3Failure(new Error(''))).toBe('unknown error');
    expect(describeS3Failure(undefined)).toBe('unknown error');
    expect(describeS3Failure('boom')).toBe('boom');
  });

  it('stops walking a self-referential cause chain', () => {
    const err: any = new Error('');
    err.cause = err;

    expect(() => describeS3Failure(err)).not.toThrow();
  });
});

describe('s3FailureError', () => {
  it('names the operation, the coordinates and the underlying reason', () => {
    const cause = connectionRefused();

    const err = s3FailureError(
      'PRESIGN_PUT_FAILED',
      { endpoint: 'http://localhost:9000', bucket: 'app-public-abc', key: 'deadbeef' },
      cause,
    );

    expect(err.message).toContain('PRESIGN_PUT_FAILED');
    expect(err.message).toContain('endpoint=http://localhost:9000');
    expect(err.message).toContain('bucket=app-public-abc');
    expect(err.message).toContain('key=deadbeef');
    expect(err.message).toContain('ECONNREFUSED');
    expect(err.cause).toBe(cause);
  });

  it('omits coordinates it was not given', () => {
    const err = s3FailureError('PRESIGN_PUT_FAILED', { endpoint: undefined, bucket: 'b' }, new Error('nope'));

    expect(err.message).not.toContain('endpoint=');
    expect(err.message).toContain('bucket=b');
  });
});

describe('the upload lane', () => {
  it('reports a signing failure with its cause instead of an empty reason', async () => {
    const cause = connectionRefused();
    const client: any = {
      // What @aws-sdk/s3-request-presigner reaches for while signing.
      config: {
        credentials: () => Promise.reject(cause),
        region: () => Promise.resolve('us-east-1'),
      },
      send: jest.fn(),
      middlewareStack: {
        clone: (): any => ({ add: (): void => undefined, resolve: (): void => undefined }),
      },
    };

    await expect(
      generatePresignedPutUrl(
        { client, bucket: 'app-public-abc', endpoint: 'http://localhost:9000' },
        'deadbeef',
        'image/png',
        12,
      ),
    ).rejects.toThrow(/PRESIGN_PUT_FAILED.*endpoint=http:\/\/localhost:9000/s);
  });

  it('reports an unreconciled bucket with a retryable typed error', () => {
    const bucket = {
      id: 'bucket-1',
      key: 'public',
      physical_name: null,
    } as BucketConfig;

    expect(() => assertBucketReconciled(
      bucket,
      '00000000-0000-0000-0000-0000000000db',
    )).toThrow('STORAGE_BUCKET_NOT_RECONCILED');

    try {
      assertBucketReconciled(bucket, '00000000-0000-0000-0000-0000000000db');
    } catch (err: any) {
      expect(err).toBeInstanceOf(StorageBucketNotReconciledError);
      expect(err.code).toBe('STORAGE_BUCKET_NOT_RECONCILED');
      expect(err.retryable).toBe(true);
      expect(err.extensions).toEqual({
        code: 'STORAGE_BUCKET_NOT_RECONCILED',
        retryable: true,
      });
      expect(err.message).toContain('public');
      expect(err.message).toContain('bucket-1');
      expect(err.message).toContain('00000000-0000-0000-0000-0000000000db');
      expect(err.message).toContain('reconciler has not yet recorded a physical name');
    }
  });
});
