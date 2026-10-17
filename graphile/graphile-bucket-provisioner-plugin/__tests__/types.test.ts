/**
 * Tests for the bucket reconciliation mutation types.
 */

import type { ProvisionBucketInput, ProvisionBucketPayload } from '../src/types';

describe('ProvisionBucketInput', () => {
  it('has a bucket key and optional owner id', () => {
    const input: ProvisionBucketInput = {
      bucketKey: 'public',
      ownerId: 'owner-123',
    };

    expect(input).toEqual({
      bucketKey: 'public',
      ownerId: 'owner-123',
    });
  });
});

describe('ProvisionBucketPayload', () => {
  it('represents the bucket row whose reconciliation was requested', () => {
    const payload: ProvisionBucketPayload = {
      bucketId: 'bucket-123',
      bucketKey: 'public',
      physicalName: null,
      provisionRequestedAt: '2026-10-16T21:00:00.000Z',
    };

    expect(payload.physicalName).toBeNull();
    expect(payload.provisionRequestedAt).toBe('2026-10-16T21:00:00.000Z');
  });
});
