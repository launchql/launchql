import type { GrafastSubscriber } from 'grafast';

import {
  ActivatableGenerationScopedRealtimeSubscriber,
  GENERATION_SUBSCRIBER_QUEUE_CAPACITY,
  GenerationScopedRealtimeSubscriber,
  RealtimeGenerationNotActiveError,
  RealtimeGenerationOverflowError,
  RealtimeGenerationSourceEndedError,
  RealtimeGenerationTopicError
} from '../src/generation-subscriber';

interface Deferred<T> {
  promise: Promise<T>;
  resolve(value: T | PromiseLike<T>): void;
  reject(error: unknown): void;
}

const deferred = <T>(): Deferred<T> => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

class ManualIterator implements AsyncIterableIterator<string> {
  private readonly buffered: string[] = [];
  private readonly waiting: Deferred<IteratorResult<string>>[] = [];
  private failure: Error | null = null;
  private done = false;
  readonly returnMock = jest.fn(async (): Promise<IteratorResult<string>> => {
    this.complete();
    return { done: true, value: undefined };
  });

  [Symbol.asyncIterator](): AsyncIterableIterator<string> {
    return this;
  }

  next(): Promise<IteratorResult<string>> {
    const value = this.buffered.shift();
    if (value !== undefined) return Promise.resolve({ done: false, value });
    if (this.failure) return Promise.reject(this.failure);
    if (this.done) return Promise.resolve({ done: true, value: undefined });
    const result = deferred<IteratorResult<string>>();
    this.waiting.push(result);
    return result.promise;
  }

  return(): Promise<IteratorResult<string>> {
    return this.returnMock();
  }

  throw(error?: unknown): Promise<IteratorResult<string>> {
    const failure = error instanceof Error ? error : new Error(String(error));
    this.fail(failure);
    return Promise.reject(failure);
  }

  push(value: string): void {
    const waiter = this.waiting.shift();
    if (waiter) waiter.resolve({ done: false, value });
    else this.buffered.push(value);
  }

  fail(error: Error): void {
    this.failure = error;
    for (const waiter of this.waiting.splice(0)) waiter.reject(error);
  }

  complete(): void {
    this.done = true;
    for (const waiter of this.waiting.splice(0)) {
      waiter.resolve({ done: true, value: undefined });
    }
  }
}

class ManualSource implements GrafastSubscriber<Record<string, string>> {
  readonly streams = new Map<string, Set<ManualIterator>>();
  readonly release = jest.fn(async (): Promise<void> => {});

  subscribe(topic: string): AsyncIterableIterator<string> {
    const stream = new ManualIterator();
    let streams = this.streams.get(topic);
    if (!streams) {
      streams = new Set();
      this.streams.set(topic, streams);
    }
    streams.add(stream);
    return stream;
  }

  publish(topic: string, payload: string): void {
    for (const stream of this.streams.get(topic) ?? []) stream.push(payload);
  }

  fail(topic: string, error: Error): void {
    for (const stream of this.streams.get(topic) ?? []) stream.fail(error);
  }

  complete(topic: string): void {
    for (const stream of this.streams.get(topic) ?? []) stream.complete();
  }
}

const flushMicrotasks = async (): Promise<void> => {
  for (let index = 0; index < 8; index++) await Promise.resolve();
};

describe('GenerationScopedRealtimeSubscriber', () => {
  it('merges database notifications with generation-local cursor publications', async () => {
    const source = new ManualSource();
    const facade = new GenerationScopedRealtimeSubscriber({
      source,
      allowedTopics: ['realtime:tenant_a.contacts']
    });
    const stream = facade.subscribe('realtime:tenant_a.contacts');
    await flushMicrotasks();

    source.publish('realtime:tenant_a.contacts', 'INSERT:db-row');
    await expect(stream.next()).resolves.toMatchObject({ value: 'INSERT:db-row' });

    facade.publish('realtime:tenant_a.contacts', 'UPDATE:cursor-row');
    await expect(stream.next()).resolves.toMatchObject({ value: 'UPDATE:cursor-row' });
    await facade.release();
    expect(source.release).toHaveBeenCalledTimes(1);
  });

  it('enforces exact allowlists rather than prefixes', async () => {
    const source = new ManualSource();
    const facade = new GenerationScopedRealtimeSubscriber({
      source,
      allowedTopics: ['realtime:tenant.contacts']
    });

    expect(() => facade.subscribe('realtime:tenant.contacts.private'))
      .toThrow(RealtimeGenerationTopicError);
    expect(() => facade.publish('realtime:tenant', 'INSERT:wrong'))
      .toThrow(RealtimeGenerationTopicError);
    await facade.release();
  });

  it('keeps cursor publications inside their Graphile generation', async () => {
    const source = new ManualSource();
    const first = new GenerationScopedRealtimeSubscriber({
      source,
      allowedTopics: ['realtime:shared.contacts'],
      releaseSourceOnRelease: false
    });
    const second = new GenerationScopedRealtimeSubscriber({
      source,
      allowedTopics: ['realtime:shared.contacts'],
      releaseSourceOnRelease: false
    });
    const firstStream = first.subscribe('realtime:shared.contacts');
    const secondStream = second.subscribe('realtime:shared.contacts');
    await flushMicrotasks();

    first.publish('realtime:shared.contacts', 'INSERT:first-cursor');
    await expect(firstStream.next()).resolves.toMatchObject({
      value: 'INSERT:first-cursor'
    });

    source.publish('realtime:shared.contacts', 'UPDATE:database');
    await expect(firstStream.next()).resolves.toMatchObject({ value: 'UPDATE:database' });
    await expect(secondStream.next()).resolves.toMatchObject({ value: 'UPDATE:database' });
    await Promise.all([first.release(), second.release()]);
  });

  it('fails an overflowing local subscriber without poisoning its peers', async () => {
    const source = new ManualSource();
    const facade = new GenerationScopedRealtimeSubscriber({
      source,
      allowedTopics: ['realtime:events']
    });
    const slow = facade.subscribe('realtime:events');

    for (let index = 0; index <= GENERATION_SUBSCRIBER_QUEUE_CAPACITY; index++) {
      facade.publish('realtime:events', `INSERT:${index}`);
    }
    await expect(slow.next()).rejects.toBeInstanceOf(RealtimeGenerationOverflowError);

    const healthy = facade.subscribe('realtime:events');
    facade.publish('realtime:events', 'INSERT:healthy');
    await expect(healthy.next()).resolves.toMatchObject({ value: 'INSERT:healthy' });
    await facade.release();
  });

  it('retains background subscription teardown failures for release', async () => {
    const teardownError = new Error('source iterator release failed');
    const source = new ManualSource();
    const facade = new GenerationScopedRealtimeSubscriber({
      source,
      allowedTopics: ['realtime:events']
    });
    const slow = facade.subscribe('realtime:events');
    await flushMicrotasks();
    [...source.streams.get('realtime:events')!][0]
      .returnMock.mockRejectedValue(teardownError);

    for (let index = 0; index <= GENERATION_SUBSCRIBER_QUEUE_CAPACITY; index++) {
      facade.publish('realtime:events', `INSERT:${index}`);
    }
    await expect(slow.next()).rejects.toBeInstanceOf(RealtimeGenerationOverflowError);
    await flushMicrotasks();

    await expect(facade.release()).rejects.toBe(teardownError);
    expect(source.release).toHaveBeenCalledTimes(1);
  });

  it('propagates source failure and unexpected completion', async () => {
    const source = new ManualSource();
    const facade = new GenerationScopedRealtimeSubscriber({
      source,
      allowedTopics: ['a', 'b']
    });
    const failed = facade.subscribe('a');
    const ended = facade.subscribe('b');
    await flushMicrotasks();

    source.fail('a', new Error('listener failed'));
    source.complete('b');

    await expect(failed.next()).rejects.toThrow('listener failed');
    await expect(ended.next()).rejects.toBeInstanceOf(
      RealtimeGenerationSourceEndedError
    );
    await facade.release();
  });

  it('makes release idempotent and awaits stream and source teardown', async () => {
    const source = new ManualSource();
    const streamReleased = deferred<IteratorResult<string>>();
    const sourceReleased = deferred<void>();
    const facade = new GenerationScopedRealtimeSubscriber({
      source,
      allowedTopics: ['a']
    });
    facade.subscribe('a');
    await flushMicrotasks();
    const sourceStream = [...source.streams.get('a')!][0];
    sourceStream.returnMock.mockImplementation(async () => streamReleased.promise);
    source.release.mockImplementation(async () => sourceReleased.promise);

    const first = facade.release();
    const second = facade.release();
    expect(first).toBe(second);
    await flushMicrotasks();
    expect(source.release).not.toHaveBeenCalled();

    streamReleased.resolve({ done: true, value: undefined });
    await flushMicrotasks();
    expect(source.release).toHaveBeenCalledTimes(1);

    let settled = false;
    void first.then(() => {
      settled = true;
    });
    await flushMicrotasks();
    expect(settled).toBe(false);
    sourceReleased.resolve();
    await first;
    expect(settled).toBe(true);
  });

  it('attempts every teardown and aggregates release failures', async () => {
    const firstError = new Error('first stream release failed');
    const secondError = new Error('second stream release failed');
    const sourceError = new Error('source release failed');
    const source = new ManualSource();
    const facade = new GenerationScopedRealtimeSubscriber({
      source,
      allowedTopics: ['a', 'b']
    });
    facade.subscribe('a');
    facade.subscribe('b');
    await flushMicrotasks();
    [...source.streams.get('a')!][0].returnMock.mockRejectedValue(firstError);
    [...source.streams.get('b')!][0].returnMock.mockRejectedValue(secondError);
    source.release.mockRejectedValue(sourceError);

    const releasing = facade.release();
    await expect(releasing).rejects.toBeInstanceOf(AggregateError);
    await expect(releasing).rejects.toMatchObject({
      errors: [firstError, secondError, sourceError]
    });
    expect(source.release).toHaveBeenCalledTimes(1);
  });
});

describe('ActivatableGenerationScopedRealtimeSubscriber', () => {
  it('fails closed before activation and owns an activated source exactly once', async () => {
    const source = new ManualSource();
    const facade = new ActivatableGenerationScopedRealtimeSubscriber();

    expect(() => facade.subscribe('realtime:tenant_a.contacts'))
      .toThrow(RealtimeGenerationNotActiveError);
    await facade.activate({
      source,
      allowedTopics: ['realtime:tenant_a.contacts']
    });

    const stream = facade.subscribe('realtime:tenant_a.contacts');
    await flushMicrotasks();
    source.publish('realtime:tenant_a.contacts', 'INSERT:row-a');
    await expect(stream.next()).resolves.toMatchObject({ value: 'INSERT:row-a' });

    const first = facade.release();
    const second = facade.release();
    expect(first).toBe(second);
    await first;
    expect(source.release).toHaveBeenCalledTimes(1);
  });

  it('releases a rejected second activation source', async () => {
    const firstSource = new ManualSource();
    const secondSource = new ManualSource();
    const facade = new ActivatableGenerationScopedRealtimeSubscriber();
    await facade.activate({ source: firstSource, allowedTopics: ['a'] });

    await expect(facade.activate({ source: secondSource, allowedTopics: ['a'] }))
      .rejects.toMatchObject({ code: 'REALTIME_GENERATION_ALREADY_ACTIVE' });
    expect(secondSource.release).toHaveBeenCalledTimes(1);
    await facade.release();
    expect(firstSource.release).toHaveBeenCalledTimes(1);
  });

  it('preserves activation and rejected-source release failures', async () => {
    const firstSource = new ManualSource();
    const secondSource = new ManualSource();
    const releaseError = new Error('rejected source release failed');
    secondSource.release.mockRejectedValue(releaseError);
    const facade = new ActivatableGenerationScopedRealtimeSubscriber();
    await facade.activate({ source: firstSource, allowedTopics: ['a'] });

    const activating = facade.activate({ source: secondSource, allowedTopics: ['a'] });
    await expect(activating).rejects.toBeInstanceOf(AggregateError);
    await expect(activating).rejects.toMatchObject({
      errors: [
        expect.objectContaining({ code: 'REALTIME_GENERATION_ALREADY_ACTIVE' }),
        releaseError
      ]
    });
    await facade.release();
  });
});
