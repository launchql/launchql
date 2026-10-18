import type { GrafastSubscriber } from 'grafast';

import type { RealtimePublisher } from './types';

export const GENERATION_SUBSCRIBER_QUEUE_CAPACITY = 256;
export const REALTIME_GENERATION_TOPIC_ERROR_CODE = 'REALTIME_GENERATION_TOPIC_INVALID';
export const REALTIME_GENERATION_RELEASED_ERROR_CODE = 'REALTIME_GENERATION_RELEASED';
export const REALTIME_GENERATION_OVERFLOW_ERROR_CODE = 'REALTIME_GENERATION_OVERFLOW';
export const REALTIME_GENERATION_SOURCE_ENDED_ERROR_CODE = 'REALTIME_GENERATION_SOURCE_ENDED';
export const REALTIME_GENERATION_NOT_ACTIVE_ERROR_CODE = 'REALTIME_GENERATION_NOT_ACTIVE';
export const REALTIME_GENERATION_ALREADY_ACTIVE_ERROR_CODE = 'REALTIME_GENERATION_ALREADY_ACTIVE';

type RealtimeTopicMap = Record<string, string>;

export interface GenerationScopedRealtimeSubscriberOptions<
  TTopics extends RealtimeTopicMap
> {
  /** Shared database notification source owned by this generation facade. */
  source: GrafastSubscriber<TTopics>;
  /** Exact topics compiled into this Graphile generation. */
  allowedTopics: readonly (keyof TTopics & string)[];
  /** Defaults to true; set false only when lifecycle ownership lives elsewhere. */
  releaseSourceOnRelease?: boolean;
}

interface Deferred<T> {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(error: unknown): void;
}

const deferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

const toError = (reason: unknown): Error => (
  reason instanceof Error ? reason : new Error(String(reason))
);

export class RealtimeGenerationTopicError extends Error {
  readonly code = REALTIME_GENERATION_TOPIC_ERROR_CODE;

  constructor(readonly topic: unknown) {
    super(`Realtime topic ${JSON.stringify(topic)} is outside this generation's allowlist`);
    this.name = 'RealtimeGenerationTopicError';
  }
}

export class RealtimeGenerationReleasedError extends Error {
  readonly code = REALTIME_GENERATION_RELEASED_ERROR_CODE;

  constructor() {
    super('Realtime generation subscriber has been released');
    this.name = 'RealtimeGenerationReleasedError';
  }
}

export class RealtimeGenerationOverflowError extends Error {
  readonly code = REALTIME_GENERATION_OVERFLOW_ERROR_CODE;

  constructor(
    readonly topic: string,
    readonly capacity: number
  ) {
    super(
      `Realtime generation queue for ${JSON.stringify(topic)} exceeded its `
      + `fixed capacity of ${capacity}`
    );
    this.name = 'RealtimeGenerationOverflowError';
  }
}

export class RealtimeGenerationSourceEndedError extends Error {
  readonly code = REALTIME_GENERATION_SOURCE_ENDED_ERROR_CODE;

  constructor(readonly topic: string) {
    super(`Realtime source for ${JSON.stringify(topic)} ended unexpectedly`);
    this.name = 'RealtimeGenerationSourceEndedError';
  }
}

export class RealtimeGenerationNotActiveError extends Error {
  readonly code = REALTIME_GENERATION_NOT_ACTIVE_ERROR_CODE;

  constructor() {
    super('Realtime generation subscriber has not been activated');
    this.name = 'RealtimeGenerationNotActiveError';
  }
}

export class RealtimeGenerationAlreadyActiveError extends Error {
  readonly code = REALTIME_GENERATION_ALREADY_ACTIVE_ERROR_CODE;

  constructor() {
    super('Realtime generation subscriber has already been activated');
    this.name = 'RealtimeGenerationAlreadyActiveError';
  }
}

class LocalQueue<T> {
  private readonly buffered: T[] = [];
  private readonly waiting: Deferred<IteratorResult<T>>[] = [];
  private terminal: 'open' | 'complete' | 'failed' = 'open';
  private failure: Error | null = null;

  constructor(
    private readonly topic: string,
    private readonly capacity: number
  ) {}

  next(): Promise<IteratorResult<T>> {
    if (this.buffered.length > 0) {
      return Promise.resolve({ done: false, value: this.buffered.shift()! });
    }
    if (this.terminal === 'failed') return Promise.reject(this.failure);
    if (this.terminal === 'complete') {
      return Promise.resolve({ done: true, value: undefined });
    }
    const result = deferred<IteratorResult<T>>();
    this.waiting.push(result);
    return result.promise;
  }

  push(value: T): RealtimeGenerationOverflowError | null {
    if (this.terminal !== 'open') return null;
    const waiter = this.waiting.shift();
    if (waiter) {
      waiter.resolve({ done: false, value });
      return null;
    }
    if (this.buffered.length >= this.capacity) {
      const error = new RealtimeGenerationOverflowError(this.topic, this.capacity);
      this.fail(error);
      return error;
    }
    this.buffered.push(value);
    return null;
  }

  complete(): void {
    if (this.terminal !== 'open') return;
    this.terminal = 'complete';
    this.buffered.length = 0;
    for (const waiter of this.waiting.splice(0)) {
      waiter.resolve({ done: true, value: undefined });
    }
  }

  fail(error: Error): void {
    if (this.terminal !== 'open') return;
    this.terminal = 'failed';
    this.failure = error;
    this.buffered.length = 0;
    for (const waiter of this.waiting.splice(0)) waiter.reject(error);
  }
}

class GenerationSubscription<T> implements AsyncIterableIterator<T> {
  private readonly queue: LocalQueue<T>;
  private readonly sourceIteratorPromise: Promise<AsyncIterableIterator<T>>;
  private sourceReturnPromise: Promise<void> | null = null;
  private stopped = false;
  private stopPromise: Promise<void> | null = null;

  constructor(
    readonly topic: string,
    source: GrafastSubscriber<Record<string, T>>,
    private readonly onStop: (
      subscription: GenerationSubscription<T>,
      teardownError: Error | null
    ) => void
  ) {
    this.queue = new LocalQueue(topic, GENERATION_SUBSCRIBER_QUEUE_CAPACITY);
    this.sourceIteratorPromise = Promise.resolve().then(() => source.subscribe(topic));
    void this.pump();
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    return this;
  }

  next(): Promise<IteratorResult<T>> {
    return this.queue.next();
  }

  async return(value?: unknown): Promise<IteratorResult<T>> {
    await this.stop();
    return { done: true, value: value as T };
  }

  async throw(error?: unknown): Promise<IteratorResult<T>> {
    const failure = error instanceof Error ? error : new Error(String(error));
    await this.stop(failure);
    throw failure;
  }

  publish(value: T): void {
    if (this.stopped) return;
    const overflow = this.queue.push(value);
    if (overflow) void this.stop(overflow).catch(() => {});
  }

  fail(error: Error): void {
    if (this.stopped) return;
    void this.stop(error).catch(() => {});
  }

  stop(error?: Error): Promise<void> {
    if (this.stopPromise) return this.stopPromise;
    this.stopped = true;
    if (error) this.queue.fail(error);
    else this.queue.complete();
    this.stopPromise = this.returnSource().then(
      () => this.onStop(this, null),
      (reason) => {
        const teardownError = toError(reason);
        this.onStop(this, teardownError);
        throw teardownError;
      }
    );
    return this.stopPromise;
  }

  private async pump(): Promise<void> {
    try {
      const iterator = await this.sourceIteratorPromise;
      if (this.stopped) {
        await this.returnSource();
        return;
      }
      for (;;) {
        const result = await iterator.next();
        if (this.stopped) return;
        if (result.done) {
          this.fail(new RealtimeGenerationSourceEndedError(this.topic));
          return;
        }
        this.publish(result.value);
      }
    } catch (error) {
      if (!this.stopped) {
        this.fail(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }

  private returnSource(): Promise<void> {
    if (this.sourceReturnPromise) return this.sourceReturnPromise;
    this.sourceReturnPromise = this.sourceIteratorPromise.then(async (iterator) => {
      await iterator.return?.();
    }, () => {
      // Source acquisition failure is already delivered to the output queue.
    });
    return this.sourceReturnPromise;
  }
}

/**
 * A Graphile-generation-local GrafastSubscriber. Database notifications are
 * forwarded from the shared source, while cursor catch-up events published
 * through publish() remain inside this exact generation.
 */
export class GenerationScopedRealtimeSubscriber<
  TTopics extends RealtimeTopicMap = RealtimeTopicMap
> implements GrafastSubscriber<TTopics>, RealtimePublisher {
  readonly allowedTopics: readonly (keyof TTopics & string)[];
  private readonly allowedTopicSet: ReadonlySet<string>;
  private readonly subscriptions = new Map<
    string,
    Set<GenerationSubscription<string>>
  >();
  private readonly releaseSourceOnRelease: boolean;
  private readonly source: GrafastSubscriber<TTopics>;
  private readonly subscriptionTeardownErrors = new Set<Error>();
  private released = false;
  private releasePromise: Promise<void> | null = null;

  constructor(options: GenerationScopedRealtimeSubscriberOptions<TTopics>) {
    if (!Array.isArray(options.allowedTopics) || options.allowedTopics.length === 0) {
      throw new RealtimeGenerationTopicError(options.allowedTopics);
    }
    if (options.allowedTopics.some((topic) => typeof topic !== 'string')) {
      throw new RealtimeGenerationTopicError(options.allowedTopics);
    }
    this.allowedTopics = Object.freeze([...new Set(options.allowedTopics)]);
    this.allowedTopicSet = new Set(this.allowedTopics);
    this.source = options.source;
    this.releaseSourceOnRelease = options.releaseSourceOnRelease ?? true;
  }

  subscribe<TTopic extends keyof TTopics = keyof TTopics>(
    topic: TTopic
  ): AsyncIterableIterator<TTopics[TTopic]> {
    if (this.released) throw new RealtimeGenerationReleasedError();
    if (typeof topic !== 'string' || !this.allowedTopicSet.has(topic)) {
      throw new RealtimeGenerationTopicError(topic);
    }

    let topicSubscriptions = this.subscriptions.get(topic);
    if (!topicSubscriptions) {
      topicSubscriptions = new Set();
      this.subscriptions.set(topic, topicSubscriptions);
    }
    const subscription = new GenerationSubscription<string>(
      topic,
      this.source as GrafastSubscriber<Record<string, string>>,
      (stopped, teardownError) => {
        topicSubscriptions!.delete(stopped);
        if (topicSubscriptions!.size === 0) this.subscriptions.delete(topic);
        if (teardownError) this.subscriptionTeardownErrors.add(teardownError);
      }
    );
    topicSubscriptions.add(subscription);
    return subscription as AsyncIterableIterator<TTopics[TTopic]>;
  }

  assertTopics(topics: readonly string[]): void {
    if (this.released) throw new RealtimeGenerationReleasedError();
    const invalid = topics.find((topic) => !this.allowedTopicSet.has(topic));
    if (invalid !== undefined) throw new RealtimeGenerationTopicError(invalid);
  }

  publish(topic: string, payload: string): void {
    this.assertTopics([topic]);
    const subscriptions = this.subscriptions.get(topic);
    if (!subscriptions) return;
    for (const subscription of [...subscriptions]) subscription.publish(payload);
  }

  release(): Promise<void> {
    if (this.releasePromise) return this.releasePromise;
    this.released = true;
    const active = [...this.subscriptions.values()].flatMap((entries) => [...entries]);
    this.releasePromise = (async () => {
      const results = await Promise.allSettled(active.map((subscription) => subscription.stop()));
      const errors = new Set(this.subscriptionTeardownErrors);
      for (const result of results) {
        if (result.status === 'rejected') errors.add(toError(result.reason));
      }
      if (this.releaseSourceOnRelease) {
        try {
          await this.source.release?.();
        } catch (reason) {
          errors.add(toError(reason));
        }
      }
      const failures = [...errors];
      if (failures.length === 1) throw failures[0];
      if (failures.length > 1) {
        throw new AggregateError(
          failures,
          'Realtime generation subscriber release failed'
        );
      }
    })();
    return this.releasePromise;
  }
}

/**
 * Stable subscriber identity installed into a PostGraphile pgService before
 * schema construction. Activation installs the exact generation facade only
 * after the build has reported all physical @realtime topics.
 */
export class ActivatableGenerationScopedRealtimeSubscriber<
  TTopics extends RealtimeTopicMap = RealtimeTopicMap
> implements GrafastSubscriber<TTopics>, RealtimePublisher {
  private delegate: GenerationScopedRealtimeSubscriber<TTopics> | null = null;
  private released = false;
  private releasePromise: Promise<void> | null = null;

  async activate(
    options: GenerationScopedRealtimeSubscriberOptions<TTopics>
  ): Promise<void> {
    if (this.released) {
      await this.releaseRejectedSource(
        options.source,
        new RealtimeGenerationReleasedError()
      );
    }
    if (this.delegate) {
      await this.releaseRejectedSource(
        options.source,
        new RealtimeGenerationAlreadyActiveError()
      );
    }

    try {
      this.delegate = new GenerationScopedRealtimeSubscriber(options);
    } catch (reason) {
      await this.releaseRejectedSource(options.source, toError(reason));
    }
  }

  subscribe<TTopic extends keyof TTopics = keyof TTopics>(
    topic: TTopic
  ): AsyncIterableIterator<TTopics[TTopic]> {
    if (this.released) throw new RealtimeGenerationReleasedError();
    if (!this.delegate) throw new RealtimeGenerationNotActiveError();
    return this.delegate.subscribe(topic);
  }

  assertTopics(topics: readonly string[]): void {
    if (this.released) throw new RealtimeGenerationReleasedError();
    if (!this.delegate) throw new RealtimeGenerationNotActiveError();
    this.delegate.assertTopics(topics);
  }

  publish(topic: string, payload: string): void {
    if (this.released) throw new RealtimeGenerationReleasedError();
    if (!this.delegate) throw new RealtimeGenerationNotActiveError();
    this.delegate.publish(topic, payload);
  }

  release(): Promise<void> {
    if (this.releasePromise) return this.releasePromise;
    this.released = true;
    this.releasePromise = this.delegate?.release() ?? Promise.resolve();
    return this.releasePromise;
  }

  private async releaseRejectedSource(
    source: GrafastSubscriber<TTopics>,
    error: Error
  ): Promise<never> {
    try {
      await source.release?.();
    } catch (reason) {
      throw new AggregateError(
        [error, toError(reason)],
        'Realtime generation activation and source release both failed'
      );
    }
    throw error;
  }
}

type LegacyEventEmitter = {
  emit(topic: string, payload: string): boolean;
};

/**
 * Transitional adapter for @dataplan/pg's current PgSubscriber. Private-field
 * access is quarantined here; RealtimeManager and new integrations depend only
 * on the explicit publisher capability.
 */
export const createPgSubscriberPublisher = (
  pgSubscriber: unknown
): RealtimePublisher | null => {
  const candidate = pgSubscriber as { eventEmitter?: LegacyEventEmitter } | null;
  const emitter = candidate && typeof candidate === 'object'
    ? candidate.eventEmitter
    : null;
  if (!emitter || typeof emitter.emit !== 'function') return null;
  const emit = emitter.emit.bind(emitter);
  return Object.freeze({
    assertTopics(): void {
      // The legacy PgSubscriber owns topic validation. New integrations use
      // GenerationScopedRealtimeSubscriber's exact preflight instead.
    },
    publish(topic: string, payload: string): void {
      emit(topic, payload);
    }
  });
};
