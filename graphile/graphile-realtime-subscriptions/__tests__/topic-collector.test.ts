import {
  RealtimeTopicCollector,
  RealtimeTopicDiscoveryError
} from '../src/topic-collector';

describe('RealtimeTopicCollector', () => {
  it('returns sorted exact physical topics for allowed schemas', () => {
    const collector = new RealtimeTopicCollector();
    collector.collect([
      { topic: 'realtime:tenant_a.z', schema: 'tenant_a', table: 'z' },
      { topic: 'realtime:tenant_a.a', schema: 'tenant_a', table: 'a' }
    ]);

    expect(collector.exactTopics(['tenant_a'])).toEqual([
      'realtime:tenant_a.a',
      'realtime:tenant_a.z'
    ]);
  });

  it.each([
    {
      descriptors: [],
      schemas: ['tenant_a'],
      code: 'REALTIME_TOPIC_DISCOVERY_EMPTY'
    },
    {
      descriptors: [
        { topic: 'realtime:tenant_b.items', schema: 'tenant_b', table: 'items' }
      ],
      schemas: ['tenant_a'],
      code: 'REALTIME_TOPIC_DISCOVERY_FOREIGN'
    },
    {
      descriptors: [
        { topic: 'realtime:tenant.a.items', schema: 'tenant.a', table: 'items' }
      ],
      schemas: ['tenant.a'],
      code: 'REALTIME_TOPIC_DISCOVERY_INVALID'
    }
  ])('fails closed for $code', ({ descriptors, schemas, code }) => {
    const collector = new RealtimeTopicCollector();
    expect(() => {
      collector.collect(descriptors);
      collector.exactTopics(schemas);
    }).toThrow(expect.objectContaining({
      code
    }) as RealtimeTopicDiscoveryError);
  });

  it('rejects missing discovery and post-discovery topic drift', () => {
    const missing = new RealtimeTopicCollector();
    expect(() => missing.exactTopics(['tenant_a'])).toThrow(expect.objectContaining({
      code: 'REALTIME_TOPIC_DISCOVERY_MISSING'
    }) as RealtimeTopicDiscoveryError);

    const changed = new RealtimeTopicCollector();
    changed.collect([
      { topic: 'realtime:tenant_a.items', schema: 'tenant_a', table: 'items' }
    ]);
    expect(() => changed.collect([
      { topic: 'realtime:tenant_a.users', schema: 'tenant_a', table: 'users' }
    ])).toThrow(expect.objectContaining({
      code: 'REALTIME_TOPIC_DISCOVERY_CHANGED'
    }) as RealtimeTopicDiscoveryError);
  });
});
