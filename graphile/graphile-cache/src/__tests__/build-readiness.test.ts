import { awaitGraphileBuildReadiness } from '../build-readiness';

interface Deferred<T> {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(error: Error): void;
}

const deferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));

describe('awaitGraphileBuildReadiness', () => {
  it('does not resolve before schema gathering and Grafserv are ready', async () => {
    const schemaResult = deferred<unknown>();
    const ready = deferred<unknown>();
    const release = jest.fn().mockResolvedValue(undefined);
    let resolved = false;
    const buildPromise = awaitGraphileBuildReadiness({
      schemaResult: schemaResult.promise,
      addTo: jest.fn().mockResolvedValue(undefined),
      ready: () => ready.promise,
      release,
    }).then(() => {
      resolved = true;
    });

    schemaResult.resolve({});
    await flushPromises();
    expect(resolved).toBe(false);

    ready.resolve(undefined);
    await buildPromise;
    expect(release).not.toHaveBeenCalled();
  });

  it('does not start readiness checks before the adapter is attached', async () => {
    const addTo = deferred<unknown>();
    const ready = jest.fn().mockResolvedValue(undefined);
    const buildPromise = awaitGraphileBuildReadiness({
      schemaResult: Promise.resolve({}),
      addTo: () => addTo.promise,
      ready,
      release: jest.fn().mockResolvedValue(undefined),
    });

    await flushPromises();
    expect(ready).not.toHaveBeenCalled();

    addTo.resolve(undefined);
    await buildPromise;
    expect(ready).toHaveBeenCalledTimes(1);
  });

  it('waits for schema construction before releasing after adapter attachment fails', async () => {
    const schemaResult = deferred<unknown>();
    const attachmentFailure = new Error('adapter attachment failed');
    const release = jest.fn().mockResolvedValue(undefined);
    const buildPromise = awaitGraphileBuildReadiness({
      schemaResult: schemaResult.promise,
      addTo: jest.fn().mockRejectedValue(attachmentFailure),
      ready: jest.fn().mockResolvedValue(undefined),
      release,
    });

    await flushPromises();
    expect(release).not.toHaveBeenCalled();

    schemaResult.resolve({});
    await expect(buildPromise).rejects.toBe(attachmentFailure);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('waits for schema construction before releasing after readiness fails', async () => {
    const schemaResult = deferred<unknown>();
    const readinessFailure = new Error('grafserv readiness failed');
    const release = jest.fn().mockResolvedValue(undefined);
    const buildPromise = awaitGraphileBuildReadiness({
      schemaResult: schemaResult.promise,
      addTo: jest.fn().mockResolvedValue(undefined),
      ready: jest.fn().mockRejectedValue(readinessFailure),
      release,
    });

    await flushPromises();
    expect(release).not.toHaveBeenCalled();

    schemaResult.resolve({});
    await expect(buildPromise).rejects.toBe(readinessFailure);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('observes schema failure while adapter attachment is pending', async () => {
    const schemaResult = deferred<unknown>();
    const addTo = deferred<unknown>();
    const release = jest.fn().mockResolvedValue(undefined);
    const failure = new Error('schema build failed early');
    const buildPromise = awaitGraphileBuildReadiness({
      schemaResult: schemaResult.promise,
      addTo: () => addTo.promise,
      ready: jest.fn().mockResolvedValue(undefined),
      release,
    });

    schemaResult.reject(failure);
    await flushPromises();
    expect(release).not.toHaveBeenCalled();

    addTo.resolve(undefined);
    await expect(buildPromise).rejects.toBe(failure);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('awaits failed-generation release before rejecting', async () => {
    const schemaResult = deferred<unknown>();
    const release = deferred<void>();
    const releaseFn = jest.fn(() => release.promise);
    const failure = new Error('schema build failed');
    let rejected = false;
    const buildPromise = awaitGraphileBuildReadiness({
      schemaResult: schemaResult.promise,
      addTo: jest.fn().mockResolvedValue(undefined),
      ready: jest.fn().mockResolvedValue(undefined),
      release: releaseFn,
    }).catch((error) => {
      rejected = true;
      throw error;
    });

    schemaResult.reject(failure);
    await flushPromises();
    expect(releaseFn).toHaveBeenCalledTimes(1);
    expect(rejected).toBe(false);

    release.resolve(undefined);
    await expect(buildPromise).rejects.toBe(failure);
  });

  it('preserves the build failure when cleanup also fails', async () => {
    const failure = new Error('schema build failed');
    const cleanupFailure = new Error('release failed');
    const onReleaseError = jest.fn();

    await expect(
      awaitGraphileBuildReadiness({
        schemaResult: Promise.reject(failure),
        addTo: jest.fn().mockResolvedValue(undefined),
        ready: jest.fn().mockResolvedValue(undefined),
        release: jest.fn().mockRejectedValue(cleanupFailure),
        onReleaseError,
      })
    ).rejects.toMatchObject({ errors: [failure, cleanupFailure], cause: failure });
    expect(onReleaseError).toHaveBeenCalledWith(cleanupFailure);
  });
});
