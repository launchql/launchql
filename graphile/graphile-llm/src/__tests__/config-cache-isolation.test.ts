import {
  getLlmBillingCacheStats,
  getLlmBillingConfig,
  invalidateLlmBillingConfig,
} from '../config-cache';

function makeClient(privateSchema: string, waitFor?: Promise<void>) {
  const query = jest.fn(async (text: string) => {
    if (waitFor) await waitFor;
    if (text.includes('information_schema.schemata'))
      return { rows: [{ exists: 1 }] };
    if (text.includes('billing_module')) {
      return {
        rows: [
          {
            public_schema: `${privateSchema}_public`,
            private_schema: privateSchema,
            record_usage_function: 'record_usage',
          },
        ],
      };
    }
    if (text.includes('inference_log_module')) {
      return {
        rows: [{ schema: privateSchema, table_name: 'usage_log_inference' }],
      };
    }
    throw new Error('unexpected SQL');
  });
  return { query };
}

function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve!: () => void;
  const promise = new Promise<void>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('LLM config cache ownership', () => {
  beforeEach(() => invalidateLlmBillingConfig());

  it('isolates the same database UUID by exact build identity', async () => {
    const databaseId = '11111111-1111-1111-1111-111111111111';
    const buildA = {};
    const buildB = {};
    const clientA = makeClient('tenant_a_private');
    const clientB = makeClient('tenant_b_private');

    const firstA = await getLlmBillingConfig(clientA, databaseId, buildA);
    const cachedA = await getLlmBillingConfig(clientA, databaseId, buildA);
    const firstB = await getLlmBillingConfig(clientB, databaseId, buildB);

    expect(firstA).toBe(cachedA);
    expect(firstA.billing?.privateSchema).toBe('tenant_a_private');
    expect(firstB.billing?.privateSchema).toBe('tenant_b_private');
    expect(clientA.query).toHaveBeenCalledTimes(4);
    expect(clientB.query).toHaveBeenCalledTimes(4);
    expect(getLlmBillingCacheStats(buildA).size).toBe(1);
    expect(getLlmBillingCacheStats(buildB).size).toBe(1);
  });

  it('keeps overlapping owners isolated and retains each owner cache', async () => {
    const databaseId = '22222222-2222-2222-2222-222222222222';
    const buildA = {};
    const buildB = {};
    const gate = deferred();
    const clientA = makeClient('overlap_a_private', gate.promise);
    const clientB = makeClient('overlap_b_private', gate.promise);

    const pending = Promise.all([
      getLlmBillingConfig(clientA, databaseId, buildA),
      getLlmBillingConfig(clientB, databaseId, buildB),
    ]);
    expect(clientA.query).toHaveBeenCalled();
    expect(clientB.query).toHaveBeenCalled();
    gate.resolve();

    const [firstA, firstB] = await pending;
    const [cachedA, cachedB] = await Promise.all([
      getLlmBillingConfig(clientA, databaseId, buildA),
      getLlmBillingConfig(clientB, databaseId, buildB),
    ]);

    expect(firstA.billing?.privateSchema).toBe('overlap_a_private');
    expect(firstB.billing?.privateSchema).toBe('overlap_b_private');
    expect(cachedA).toBe(firstA);
    expect(cachedB).toBe(firstB);
    expect(clientA.query).toHaveBeenCalledTimes(4);
    expect(clientB.query).toHaveBeenCalledTimes(4);
  });

  it('supports owner-specific and ownerless invalidation', async () => {
    const databaseId = '33333333-3333-3333-3333-333333333333';
    const buildA = {};
    const buildB = {};
    const clientA = makeClient('invalidate_a_private');
    const clientB = makeClient('invalidate_b_private');

    const [firstA, firstB] = await Promise.all([
      getLlmBillingConfig(clientA, databaseId, buildA),
      getLlmBillingConfig(clientB, databaseId, buildB),
    ]);

    invalidateLlmBillingConfig(databaseId, buildA);
    const cachedB = await getLlmBillingConfig(clientB, databaseId, buildB);
    const refreshedA = await getLlmBillingConfig(clientA, databaseId, buildA);
    expect(cachedB).toBe(firstB);
    expect(refreshedA).not.toBe(firstA);

    invalidateLlmBillingConfig(databaseId);
    const refreshedB = await getLlmBillingConfig(clientB, databaseId, buildB);
    expect(refreshedB).not.toBe(firstB);
    expect(clientA.query).toHaveBeenCalledTimes(8);
    expect(clientB.query).toHaveBeenCalledTimes(8);
  });

  it('keeps the original two-argument call scoped to its client', async () => {
    const databaseId = '44444444-4444-4444-4444-444444444444';
    const client = makeClient('compat_private');

    const first = await getLlmBillingConfig(client, databaseId);
    const cached = await getLlmBillingConfig(client, databaseId);

    expect(cached).toBe(first);
    expect(first.billing?.privateSchema).toBe('compat_private');
    expect(client.query).toHaveBeenCalledTimes(4);
    expect(getLlmBillingCacheStats(client).size).toBe(1);
  });

  it('rejects an invalid cache owner', async () => {
    await expect(
      getLlmBillingConfig(
        makeClient('tenant_private'),
        'database-a',
        null as any
      )
    ).rejects.toThrow('LLM_CONFIG_CACHE_SCOPE_UNAVAILABLE');
    expect(() => getLlmBillingCacheStats(null as any)).toThrow(
      'LLM_CONFIG_CACHE_SCOPE_UNAVAILABLE'
    );
    expect(() => invalidateLlmBillingConfig('database-a', null as any)).toThrow(
      'LLM_CONFIG_CACHE_SCOPE_UNAVAILABLE'
    );
  });
});
