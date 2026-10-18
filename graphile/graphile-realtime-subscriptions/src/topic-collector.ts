import type { RealtimeTopicDescriptor } from './types';

export const REALTIME_TOPIC_DISCOVERY_MISSING_ERROR_CODE =
  'REALTIME_TOPIC_DISCOVERY_MISSING';
export const REALTIME_TOPIC_DISCOVERY_EMPTY_ERROR_CODE =
  'REALTIME_TOPIC_DISCOVERY_EMPTY';
export const REALTIME_TOPIC_DISCOVERY_INVALID_ERROR_CODE =
  'REALTIME_TOPIC_DISCOVERY_INVALID';
export const REALTIME_TOPIC_DISCOVERY_FOREIGN_ERROR_CODE =
  'REALTIME_TOPIC_DISCOVERY_FOREIGN';
export const REALTIME_TOPIC_DISCOVERY_CHANGED_ERROR_CODE =
  'REALTIME_TOPIC_DISCOVERY_CHANGED';

type RealtimeTopicDiscoveryCode =
  | typeof REALTIME_TOPIC_DISCOVERY_MISSING_ERROR_CODE
  | typeof REALTIME_TOPIC_DISCOVERY_EMPTY_ERROR_CODE
  | typeof REALTIME_TOPIC_DISCOVERY_INVALID_ERROR_CODE
  | typeof REALTIME_TOPIC_DISCOVERY_FOREIGN_ERROR_CODE
  | typeof REALTIME_TOPIC_DISCOVERY_CHANGED_ERROR_CODE;

export class RealtimeTopicDiscoveryError extends Error {
  constructor(
    readonly code: RealtimeTopicDiscoveryCode,
    message: string
  ) {
    super(message);
    this.name = 'RealtimeTopicDiscoveryError';
  }
}

const containsUnpairedSurrogate = (value: string): boolean => {
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return true;
      index++;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return true;
    }
  }
  return false;
};

const assertIdentifierPart = (
  part: 'schema' | 'table',
  value: unknown
): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new RealtimeTopicDiscoveryError(
      REALTIME_TOPIC_DISCOVERY_INVALID_ERROR_CODE,
      `Realtime ${part} must be a non-empty string`
    );
  }
  if (
    value.includes('\0')
    || value.includes('.')
    || containsUnpairedSurrogate(value)
  ) {
    throw new RealtimeTopicDiscoveryError(
      REALTIME_TOPIC_DISCOVERY_INVALID_ERROR_CODE,
      `Realtime ${part} cannot be represented unambiguously in a notification topic`
    );
  }
  return value;
};

const normalizeDescriptor = (
  descriptor: RealtimeTopicDescriptor
): Readonly<RealtimeTopicDescriptor> => {
  const schema = assertIdentifierPart('schema', descriptor?.schema);
  const table = assertIdentifierPart('table', descriptor?.table);
  const expectedTopic = `realtime:${schema}.${table}`;
  if (
    descriptor?.topic !== expectedTopic
    || expectedTopic.includes('\0')
    || containsUnpairedSurrogate(expectedTopic)
    || Buffer.byteLength(expectedTopic, 'utf8') > 63
  ) {
    throw new RealtimeTopicDiscoveryError(
      REALTIME_TOPIC_DISCOVERY_INVALID_ERROR_CODE,
      'Realtime topic does not exactly match its physical schema/table or exceeds PostgreSQL limits'
    );
  }
  return Object.freeze({ topic: expectedTopic, schema, table });
};

const descriptorKey = (descriptor: RealtimeTopicDescriptor): string =>
  `${descriptor.schema}\0${descriptor.table}\0${descriptor.topic}`;

/**
 * One schema-generation collector. It accepts repeated byte-equivalent build
 * callbacks, but rejects topic drift so an already activated listener cannot
 * silently become incomplete after a Graphile rebuild.
 */
export class RealtimeTopicCollector {
  private descriptors: readonly Readonly<RealtimeTopicDescriptor>[] | null = null;

  readonly collect = (input: readonly RealtimeTopicDescriptor[]): void => {
    if (!Array.isArray(input)) {
      throw new RealtimeTopicDiscoveryError(
        REALTIME_TOPIC_DISCOVERY_INVALID_ERROR_CODE,
        'Realtime topic discovery did not provide an array'
      );
    }
    const byTopic = new Map<string, Readonly<RealtimeTopicDescriptor>>();
    for (const candidate of input) {
      const descriptor = normalizeDescriptor(candidate);
      const previous = byTopic.get(descriptor.topic);
      if (previous && descriptorKey(previous) !== descriptorKey(descriptor)) {
        throw new RealtimeTopicDiscoveryError(
          REALTIME_TOPIC_DISCOVERY_INVALID_ERROR_CODE,
          `Realtime notification topic ${JSON.stringify(descriptor.topic)} is ambiguous`
        );
      }
      byTopic.set(descriptor.topic, descriptor);
    }
    const next = Object.freeze(
      [...byTopic.values()].sort((left, right) => (
        left.topic < right.topic ? -1 : left.topic > right.topic ? 1 : 0
      ))
    );
    if (this.descriptors) {
      const previousKeys = this.descriptors.map(descriptorKey);
      const nextKeys = next.map(descriptorKey);
      if (
        previousKeys.length !== nextKeys.length
        || previousKeys.some((key, index) => key !== nextKeys[index])
      ) {
        throw new RealtimeTopicDiscoveryError(
          REALTIME_TOPIC_DISCOVERY_CHANGED_ERROR_CODE,
          'Realtime topics changed after the generation discovery boundary'
        );
      }
      return;
    }
    this.descriptors = next;
  };

  exactTopics(allowedSchemas: readonly string[]): readonly string[] {
    if (!this.descriptors) {
      throw new RealtimeTopicDiscoveryError(
        REALTIME_TOPIC_DISCOVERY_MISSING_ERROR_CODE,
        'Realtime plugin did not report its compiled notification topics'
      );
    }
    if (this.descriptors.length === 0) {
      throw new RealtimeTopicDiscoveryError(
        REALTIME_TOPIC_DISCOVERY_EMPTY_ERROR_CODE,
        'Shared realtime requires at least one compiled @realtime topic'
      );
    }
    if (
      !Array.isArray(allowedSchemas)
      || allowedSchemas.length === 0
      || allowedSchemas.some((schema) => typeof schema !== 'string' || schema.length === 0)
    ) {
      throw new RealtimeTopicDiscoveryError(
        REALTIME_TOPIC_DISCOVERY_INVALID_ERROR_CODE,
        'Shared realtime requires at least one exact allowed physical schema'
      );
    }
    const allowed = new Set(allowedSchemas);
    const foreign = this.descriptors.find(({ schema }) => !allowed.has(schema));
    if (foreign) {
      throw new RealtimeTopicDiscoveryError(
        REALTIME_TOPIC_DISCOVERY_FOREIGN_ERROR_CODE,
        `Realtime topic ${JSON.stringify(foreign.topic)} is outside this Graphile generation`
      );
    }
    return Object.freeze(this.descriptors.map(({ topic }) => topic));
  }
}
